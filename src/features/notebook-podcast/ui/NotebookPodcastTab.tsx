import type { PodcastScriptLine } from "@/entities/notebook/api/dto/notebook.types";
import {
  PODCAST_TONE_OPTIONS,
  type PodcastTone,
} from "@/features/notebook-artifacts/model/notebook-artifacts";
import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import { Button } from "@/shared/components/ui/button";
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

type NotebookPodcastTabProps = {
  podcastUrl: string | null | undefined;
  podcastScript: PodcastScriptLine[] | null | undefined;
  podcastTone: PodcastTone;
  onPodcastToneChange: (value: PodcastTone) => void;
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
  onPodcastToneChange,
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
            <Button disabled={isPending} onClick={onGenerate} type="button">
              {isPending ? <Spinner /> : "Обновить подкаст"}
            </Button>
          </>
        }
        description="Аудиоверсия и сценарий по содержимому блокнота."
        title="Подкаст"
      />

      {podcastUrl ? (
        <div className="space-y-4 rounded-3xl border border-border bg-card px-6 py-5">
          <audio className="w-full" controls src={podcastUrl} />
          <p className="break-all text-xs text-muted-foreground">
            {podcastUrl}
          </p>
        </div>
      ) : (
        <ArtifactPlaceholder
          title="Подкаст пока не готов"
          description="После генерации здесь появится аудиофайл, связанный с этим блокнотом."
        />
      )}

      {podcastScript.length > 0 && (
        <div className="rounded-3xl border border-border bg-card px-6 py-5">
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
