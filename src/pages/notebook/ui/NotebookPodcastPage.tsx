import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import { type PodcastTone } from "@/features/notebook-artifacts/model/notebook-artifacts";
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

  const podcastMutation = useMutation({
    mutationKey: notebookKeys.podcast(),
    mutationFn: () => notebookApi.podcast(notebookId, { tone: podcastTone }),
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
      isPending={podcastMutation.isPending}
      onGenerate={() => void handleGenerate()}
      onPodcastToneChange={setPodcastTone}
      podcastScript={notebook?.podcast_script}
      podcastTone={podcastTone}
      podcastUrl={notebook?.podcast_url}
    />
  );
}
