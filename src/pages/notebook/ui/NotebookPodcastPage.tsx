import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import { notebookOptions } from "@/entities/notebook/api/notebook.options";
import { type PodcastTone } from "@/features/notebook-artifacts/model/notebook-artifacts";
import { normalizePodcastVoices } from "@/features/notebook-podcast/model/podcast-voices";
import { NotebookPodcastTab } from "@/features/notebook-podcast/ui/NotebookPodcastTab";
import { runNotebookRequestWithToast } from "@/features/notebook-workspace/lib/notebook-ui";
import { getNotebookModuleAvailability } from "@/features/notebook-workspace/model/notebook-module-availability";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";
import { NotebookModuleUnavailable } from "@/features/notebook-workspace/ui/NotebookModuleUnavailable";

export function NotebookPodcastPage() {
  const queryClient = useQueryClient();
  const { notebookId, notebook } = useNotebookRoute();
  const moduleAvailability = getNotebookModuleAvailability(notebook, "podcast");
  const [podcastTone, setPodcastTone] = useState<PodcastTone>("popular");
  const [selectedFirstVoiceId, setSelectedFirstVoiceId] = useState("");
  const [selectedSecondVoiceId, setSelectedSecondVoiceId] = useState("");
  const [previewVoiceId, setPreviewVoiceId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const voicesQuery = useQuery({
    ...notebookOptions.voices(),
    enabled: moduleAvailability.enabled,
  });
  const voices = normalizePodcastVoices(voicesQuery.data);
  const firstVoiceId =
    selectedFirstVoiceId &&
    voices.some((voice) => voice.id === selectedFirstVoiceId)
      ? selectedFirstVoiceId
      : (voices[0]?.id ?? "");
  const secondVoiceId =
    selectedSecondVoiceId &&
    voices.some((voice) => voice.id === selectedSecondVoiceId)
      ? selectedSecondVoiceId
      : (voices.find((voice) => voice.id !== firstVoiceId)?.id ??
        voices[0]?.id ??
        "");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const podcastMutation = useMutation({
    mutationKey: notebookKeys.podcast(),
    mutationFn: () =>
      notebookApi.podcast(notebookId, {
        tone: podcastTone,
        speakers: [
          { name: "Алекс", voice: firstVoiceId },
          { name: "Мария", voice: secondVoiceId },
        ],
      }),
  });
  const previewMutation = useMutation({
    mutationKey: [...notebookKeys.voices(), "sample"],
    mutationFn: async (voiceId: string) => {
      const blob = await notebookApi.voiceSample(voiceId);
      return {
        voiceId,
        url: URL.createObjectURL(blob),
      };
    },
    onSuccess: ({ voiceId, url }) => {
      setPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }

        return url;
      });
      setPreviewVoiceId(voiceId);
    },
    onError: () => {
      toast.error("Не удалось загрузить пример голоса");
    },
  });

  const handleGenerate = async () =>
    runNotebookRequestWithToast({
      request: podcastMutation.mutateAsync().then(async (result) => {
        await queryClient.invalidateQueries({
          queryKey: notebookKeys.detail(notebookId),
        });
        return result;
      }),
      loading: "Генерируем подкаст...",
      success: "Подкаст обновлен",
      error: "Не удалось сгенерировать подкаст",
    });
  const canGeneratePodcast = Boolean(firstVoiceId && secondVoiceId);
  const previewVoiceLabel =
    voices.find((voice) => voice.id === previewVoiceId)?.label ?? null;

  if (!moduleAvailability.enabled) {
    return (
      <NotebookModuleUnavailable
        notebookId={notebookId}
        reason={moduleAvailability.reason ?? "Модуль временно недоступен."}
        title="Подкаст"
      />
    );
  }

  return (
    <NotebookPodcastTab
      canGeneratePodcast={canGeneratePodcast}
      isPending={podcastMutation.isPending}
      onGenerate={() => void handleGenerate()}
      onPodcastToneChange={setPodcastTone}
      onPreviewVoice={(voiceId) => void previewMutation.mutateAsync(voiceId)}
      onPrimaryVoiceChange={setSelectedFirstVoiceId}
      onSecondaryVoiceChange={setSelectedSecondVoiceId}
      podcastScript={notebook?.podcast_script}
      podcastTone={podcastTone}
      podcastUrl={notebook?.podcast_url}
      previewUrl={previewUrl}
      previewVoiceLabel={previewVoiceLabel}
      primaryVoiceId={firstVoiceId}
      secondaryVoiceId={secondVoiceId}
      voices={voices}
      voicesError={voicesQuery.isError}
      voicesLoading={voicesQuery.isPending}
      voicePreviewLoadingId={
        previewMutation.isPending ? previewMutation.variables : null
      }
    />
  );
}
