import {
  AudioLines,
  BookOpenText,
  BrainCircuit,
  GitBranchPlus,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import type {
  MindmapNode,
  Notebook,
  NotebookFlashcard,
  PodcastScriptLine,
} from "@/entities/notebook/api/dto/notebook.types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/motion-tabs";
import { AUDIO_BASE_URL } from "@/shared/constants/api";

export type NotebookTab = "summary" | "mindmap" | "flashcards" | "podcast";

const summaryStyleOptions = ["official", "simple", "concise"] as const;
export type SummaryStyle = (typeof summaryStyleOptions)[number];

const podcastToneOptions = ["popular", "formal", "energetic"] as const;
export type PodcastTone = (typeof podcastToneOptions)[number];

type NormalizedFlashcard = {
  question: string;
  answer: string;
};

type NormalizedPodcastLine = {
  speaker: string;
  text: string;
};

type NotebookTabsProps = {
  notebook: Notebook | undefined;
  isPending: boolean;
  activeTab: NotebookTab;
  onTabChange: (value: NotebookTab) => void;
  summaryStyle: SummaryStyle;
  onSummaryStyleChange: (value: SummaryStyle) => void;
  onGenerateSummary: () => void;
  isSummaryPending: boolean;
  onGenerateMindmap: () => void;
  isMindmapPending: boolean;
  flashcardsCount: number;
  onFlashcardsCountChange: (value: number) => void;
  onGenerateFlashcards: () => void;
  isFlashcardsPending: boolean;
  podcastTone: PodcastTone;
  onPodcastToneChange: (value: PodcastTone) => void;
  onGeneratePodcast: () => void;
  isPodcastPending: boolean;
};

const summaryMarkdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-2xl font-semibold leading-tight text-[var(--text-h)]">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-xl font-semibold leading-tight text-[var(--text-h)]">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-lg font-semibold leading-tight text-[var(--text-h)]">
      {children}
    </h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-sm leading-7 text-foreground">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-[var(--text-h)]">{children}</strong>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-foreground">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
};

function normalizeMindmap(value: Notebook["mindmap"]) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.title !== "string") {
    return null;
  }

  return value as MindmapNode;
}

function normalizeFlashcards(value: NotebookFlashcard[] | null | undefined) {
  if (!value) {
    return [] as NormalizedFlashcard[];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return { question: item, answer: "" };
      }

      const question = item.question ?? item.front ?? item.term;
      const answer = item.answer ?? item.back ?? item.definition;

      if (typeof question !== "string") {
        return null;
      }

      return {
        question,
        answer: typeof answer === "string" ? answer : "",
      };
    })
    .filter((item): item is NormalizedFlashcard => item !== null);
}

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

  return `${AUDIO_BASE_URL}${url}`;
}

export function ArtifactPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-muted/35 px-6 py-12 text-center">
      <p className="text-lg font-semibold text-[var(--text-h)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function MindmapTree({ node }: { node: MindmapNode }) {
  return (
    <li className="relative pl-6">
      <span className="absolute left-0 top-3 h-px w-3 bg-border" />
      <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
        <p className="font-medium text-[var(--text-h)]">{node.title}</p>
      </div>
      {node.children.length > 0 && (
        <ul className="mt-4 space-y-3 border-l border-border/70 pl-4">
          {node.children.map((child, index) => (
            <MindmapTree key={`${child.title}-${index}`} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function NotebookTabs({
  notebook,
  isPending,
  activeTab,
  onTabChange,
  summaryStyle,
  onSummaryStyleChange,
  onGenerateSummary,
  isSummaryPending,
  onGenerateMindmap,
  isMindmapPending,
  flashcardsCount,
  onFlashcardsCountChange,
  onGenerateFlashcards,
  isFlashcardsPending,
  podcastTone,
  onPodcastToneChange,
  onGeneratePodcast,
  isPodcastPending,
}: NotebookTabsProps) {
  const mindmap = normalizeMindmap(notebook?.mindmap);
  const flashcards = normalizeFlashcards(notebook?.flashcards);
  const podcastScript = normalizePodcastScript(notebook?.podcast_script);
  const podcastUrl = getPodcastUrl(notebook?.podcast_url);

  return (
    <Card className="ring-1 ring-border/80">
      <CardHeader>
        <Tabs
          value={activeTab}
          onValueChange={(value) => onTabChange(value as NotebookTab)}
          className="gap-4"
        >
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-muted p-2 md:grid-cols-4">
            {[
              { value: "summary", label: "Саммари", icon: BookOpenText },
              { value: "mindmap", label: "Mindmap", icon: GitBranchPlus },
              {
                value: "flashcards",
                label: "Карточки",
                icon: BrainCircuit,
              },
              { value: "podcast", label: "Подкаст", icon: AudioLines },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="h-10 rounded-xl font-medium"
              >
                <Icon className="size-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-3xl" />
            <Skeleton className="h-72 w-full rounded-3xl" />
          </div>
        ) : !notebook ? (
          <ArtifactPlaceholder
            title="Не удалось загрузить блокнот"
            description="Похоже, блокнот недоступен или был удален. Попробуй выбрать другой в sidebar."
          />
        ) : activeTab === "summary" ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 rounded-3xl border border-border bg-muted/25 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-lg font-semibold text-[var(--text-h)]">
                  Саммари блокнота
                </p>
                <p className="text-sm text-muted-foreground">
                  Краткая выжимка по текущим источникам. Можно перегенерировать
                  в другом стиле.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  className="h-11 rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none"
                  onChange={(event) =>
                    onSummaryStyleChange(event.target.value as SummaryStyle)
                  }
                  value={summaryStyle}
                >
                  {summaryStyleOptions.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
                <Button
                  disabled={isSummaryPending}
                  onClick={onGenerateSummary}
                  type="button"
                >
                  {isSummaryPending ? <Spinner /> : "Обновить саммари"}
                </Button>
              </div>
            </div>

            {notebook.summary ? (
              <div className="rounded-3xl border border-border bg-card px-6 py-5">
                <div className="space-y-4">
                  <ReactMarkdown components={summaryMarkdownComponents}>
                    {notebook.summary}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <ArtifactPlaceholder
                title="Саммари пока нет"
                description="Сгенерируй первый summary, и он будет храниться прямо в ответе блокнота."
              />
            )}
          </div>
        ) : activeTab === "mindmap" ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 rounded-3xl border border-border bg-muted/25 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-lg font-semibold text-[var(--text-h)]">
                  Mindmap
                </p>
                <p className="text-sm text-muted-foreground">
                  Иерархия тем и подтем по материалам блокнота.
                </p>
              </div>
              <Button
                disabled={isMindmapPending}
                onClick={onGenerateMindmap}
                type="button"
              >
                {isMindmapPending ? <Spinner /> : "Обновить mindmap"}
              </Button>
            </div>

            {mindmap ? (
              <div className="rounded-3xl border border-border bg-card px-6 py-5">
                <ul className="space-y-4">
                  <MindmapTree node={mindmap} />
                </ul>
              </div>
            ) : notebook.mindmap ? (
              <div className="rounded-3xl border border-border bg-card px-6 py-5">
                <pre className="overflow-x-auto text-sm leading-6 text-muted-foreground">
                  {JSON.stringify(notebook.mindmap, null, 2)}
                </pre>
              </div>
            ) : (
              <ArtifactPlaceholder
                title="Mindmap пока не построена"
                description="Сгенерируй карту, чтобы увидеть структуру знаний по этому блокноту."
              />
            )}
          </div>
        ) : activeTab === "flashcards" ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 rounded-3xl border border-border bg-muted/25 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-lg font-semibold text-[var(--text-h)]">
                  Флэш-карточки
                </p>
                <p className="text-sm text-muted-foreground">
                  Набор карточек для быстрого повторения по материалам блокнота.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  className="w-28"
                  max={50}
                  min={1}
                  onChange={(event) =>
                    onFlashcardsCountChange(Number(event.target.value) || 1)
                  }
                  type="number"
                  value={flashcardsCount}
                />
                <Button
                  disabled={isFlashcardsPending}
                  onClick={onGenerateFlashcards}
                  type="button"
                >
                  {isFlashcardsPending ? <Spinner /> : "Обновить карточки"}
                </Button>
              </div>
            </div>

            {flashcards.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {flashcards.map((card, index) => (
                  <div
                    key={`${card.question}-${index}`}
                    className="rounded-3xl border border-border bg-card px-5 py-5"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Карточка {index + 1}
                    </p>
                    <p className="mt-4 text-lg font-semibold text-[var(--text-h)]">
                      {card.question}
                    </p>
                    <Separator className="my-4" />
                    <p className="text-sm leading-7 text-muted-foreground">
                      {card.answer ||
                        "Ответ не указан явно, но карточка сохранена в блокноте."}
                    </p>
                  </div>
                ))}
              </div>
            ) : notebook.flashcards ? (
              <div className="rounded-3xl border border-border bg-card px-6 py-5">
                <pre className="overflow-x-auto text-sm leading-6 text-muted-foreground">
                  {JSON.stringify(notebook.flashcards, null, 2)}
                </pre>
              </div>
            ) : (
              <ArtifactPlaceholder
                title="Карточек пока нет"
                description="Сгенерируй набор карточек, и они сохранятся в ответе конкретного блокнота."
              />
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 rounded-3xl border border-border bg-muted/25 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-lg font-semibold text-[var(--text-h)]">
                  Подкаст
                </p>
                <p className="text-sm text-muted-foreground">
                  Аудиоверсия и сценарий по содержимому блокнота.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  className="h-11 rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none"
                  onChange={(event) =>
                    onPodcastToneChange(event.target.value as PodcastTone)
                  }
                  value={podcastTone}
                >
                  {podcastToneOptions.map((tone) => (
                    <option key={tone} value={tone}>
                      {tone}
                    </option>
                  ))}
                </select>
                <Button
                  disabled={isPodcastPending}
                  onClick={onGeneratePodcast}
                  type="button"
                >
                  {isPodcastPending ? <Spinner /> : "Обновить подкаст"}
                </Button>
              </div>
            </div>

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
        )}
      </CardContent>
    </Card>
  );
}
