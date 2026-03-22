import type { PodcastScriptLine } from "@/entities/notebook/api/dto/notebook.types";
import {
  PODCAST_TONE_OPTIONS,
  type PodcastTone,
} from "@/features/notebook-artifacts/model/notebook-artifacts";
import type { PodcastVoiceOption } from "@/features/notebook-podcast/model/podcast-voices";
import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Spinner } from "@/shared/components/ui/spinner";
import { API_BASE_URL } from "@/shared/constants/api";
import { Headphones, PlayCircle } from "lucide-react";

type NotebookPodcastTabProps = {
  podcastUrl: string | null | undefined;
  podcastScript: PodcastScriptLine[] | null | undefined;
  podcastTone: PodcastTone;
  voices: PodcastVoiceOption[];
  voicesLoading: boolean;
  voicesError: boolean;
  primaryVoiceId: string;
  secondaryVoiceId: string;
  previewVoiceLabel: string | null;
  previewUrl: string | null;
  voicePreviewLoadingId: string | null;
  canGeneratePodcast: boolean;
  onPodcastToneChange: (value: PodcastTone) => void;
  onPrimaryVoiceChange: (value: string) => void;
  onSecondaryVoiceChange: (value: string) => void;
  onPreviewVoice: (voiceId: string) => void;
  onGenerate: () => void;
  isPending: boolean;
};

type NormalizedPodcastLine = {
  speaker: string;
  text: string;
};

function normalizePodcastScript(value: PodcastScriptLine[] | null | undefined) {
  if (!value) {
    return [] as NormalizedPodcastLine[];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return { speaker: "Реплика", text: item };
      }

      const text = item.text ?? item.content;
      if (typeof text !== "string") {
        return null;
      }

      return {
        speaker: typeof item.speaker === "string" ? item.speaker : "Реплика",
        text,
      };
    })
    .filter((item): item is NormalizedPodcastLine => item !== null);
}

function getPodcastUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_BASE_URL}${url}`;
}

export function NotebookPodcastTab({
  podcastUrl: rawPodcastUrl,
  podcastScript: rawPodcastScript,
  podcastTone,
  voices,
  voicesLoading,
  voicesError,
  primaryVoiceId,
  secondaryVoiceId,
  previewVoiceLabel,
  previewUrl,
  voicePreviewLoadingId,
  canGeneratePodcast,
  onPodcastToneChange,
  onPrimaryVoiceChange,
  onSecondaryVoiceChange,
  onPreviewVoice,
  onGenerate,
  isPending,
}: NotebookPodcastTabProps) {
  const podcastUrl = getPodcastUrl(rawPodcastUrl);
  const podcastScript = normalizePodcastScript(rawPodcastScript);

  return (
    <div className="space-y-5">
      <NotebookModuleHeader
        actions={
          <>
            <Select
              onValueChange={(value) =>
                onPodcastToneChange(value as PodcastTone)
              }
              value={podcastTone}
            >
              <SelectTrigger className="h-11 w-full sm:w-44">
                <SelectValue placeholder="Выбери тон" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PODCAST_TONE_OPTIONS.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value}>
                      {tone.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              disabled={isPending || !canGeneratePodcast}
              onClick={onGenerate}
              type="button"
            >
              {isPending ? <Spinner /> : "Обновить подкаст"}
            </Button>
          </>
        }
        description="Аудиоверсия и сценарий по содержимому блокнота."
        title="Подкаст"
      />

      <Card className="ring-1 ring-border/80">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Голоса ведущих
          </CardTitle>
          <CardDescription>
            Выбери озвучку для Алекса и Марии. Сэмпл можно прослушать до
            генерации.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                key: "primary",
                title: "Алекс",
                value: primaryVoiceId,
                onChange: onPrimaryVoiceChange,
              },
              {
                key: "secondary",
                title: "Мария",
                value: secondaryVoiceId,
                onChange: onSecondaryVoiceChange,
              },
            ].map((speaker) => (
              <div
                key={speaker.key}
                className="rounded-2xl border border-border bg-muted/20 p-4"
              >
                <p className="text-sm font-medium text-foreground">
                  {speaker.title}
                </p>
                <div className="mt-3 flex flex-col gap-3">
                  <Select
                    disabled={voicesLoading || voices.length === 0}
                    onValueChange={speaker.onChange}
                    value={speaker.value}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue
                        placeholder={
                          voicesLoading ? "Загружаем голоса..." : "Выбери голос"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {voices.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            {voice.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button
                    disabled={!speaker.value || voicesLoading}
                    onClick={() => onPreviewVoice(speaker.value)}
                    type="button"
                    variant="outline"
                  >
                    {voicePreviewLoadingId === speaker.value ? (
                      <Spinner />
                    ) : (
                      <PlayCircle className="size-4" />
                    )}
                    Послушать голос
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {voicesError ? (
            <p className="text-sm text-destructive">
              Не удалось загрузить список голосов.
            </p>
          ) : !voicesLoading && voices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Доступные голоса пока не найдены.
            </p>
          ) : null}

          {previewUrl && previewVoiceLabel ? (
            <div className="rounded-2xl border border-border bg-card px-4 py-4">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <Headphones className="size-4" />
                Предпросмотр: {previewVoiceLabel}
              </p>
              <audio className="mt-3 w-full" controls src={previewUrl} />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {podcastUrl ? (
        <div className="space-y-4 rounded-3xl border border-border bg-card px-6 py-5">
          <audio className="w-full" controls src={podcastUrl} />
        </div>
      ) : (
        <ArtifactPlaceholder
          title="Подкаст пока не готов"
          description="После генерации здесь появится аудиофайл, связанный с этим блокнотом."
        />
      )}

      {podcastScript.length > 0 && (
        <div className="rounded-3xl border border-border bg-card px-6 py-5 h-150 overflow-auto">
          <p className="text-sm font-medium text-muted-foreground">
            Сценарий подкаста
          </p>
          <div className="mt-4 space-y-3">
            {podcastScript.map((line, index) => (
              <div
                key={`${line.speaker}-${index}`}
                className="rounded-2xl bg-muted/35 px-4 py-3"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {line.speaker}
                </p>
                <p className="mt-2 text-sm leading-7 text-foreground">
                  {line.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
