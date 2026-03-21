import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import {
  AudioLines,
  BookOpenText,
  BrainCircuit,
  FolderPlus,
  GitBranchPlus,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { type ChangeEvent, useMemo, useState } from "react";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import { notebookOptions } from "@/entities/notebook/api/notebook.options";
import type {
  MindmapNode,
  Notebook,
  NotebookFlashcard,
  PodcastScriptLine,
} from "@/entities/notebook/api/dto/notebook.types";
import { AUDIO_BASE_URL } from "@/shared/constants/api";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Spinner } from "@/shared/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";

type NotebookTab = "summary" | "mindmap" | "flashcards" | "podcast";

type Notice = {
  tone: "success" | "error";
  text: string;
};

type NormalizedFlashcard = {
  question: string;
  answer: string;
};

type NormalizedPodcastLine = {
  speaker: string;
  text: string;
};

const summaryStyles = ["official", "simple", "concise"] as const;
const podcastTones = ["popular", "formal", "energetic"] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

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

function ArtifactPlaceholder({
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

const notebookRouteApi = getRouteApi("/notebooks/$id");

export function NotebookPage() {
  const { id: notebookId } = notebookRouteApi.useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<NotebookTab>("summary");
  const [summaryStyle, setSummaryStyle] =
    useState<(typeof summaryStyles)[number]>("official");
  const [flashcardsCount, setFlashcardsCount] = useState(10);
  const [podcastTone, setPodcastTone] =
    useState<(typeof podcastTones)[number]>("popular");
  const [notice, setNotice] = useState<Notice | null>(null);

  const notebookQuery = useQuery(notebookOptions.detail(notebookId));
  const notebook = notebookQuery.data;

  const summaryMutation = useMutation({
    mutationKey: notebookKeys.summary(),
    mutationFn: () => notebookApi.summary(notebookId, { style: summaryStyle }),
    onSuccess: async () => {
      setNotice({
        tone: "success",
        text: "Саммари обновлено. Новая версия уже подгружена в страницу.",
      });
      await queryClient.invalidateQueries({
        queryKey: notebookKeys.detail(notebookId),
      });
    },
    onError: (error) => {
      setNotice({
        tone: "error",
        text: getErrorMessage(error, "Не удалось обновить саммари"),
      });
    },
  });

  const mindmapMutation = useMutation({
    mutationKey: notebookKeys.mindmap(),
    mutationFn: () => notebookApi.mindmap(notebookId),
    onSuccess: async () => {
      setNotice({
        tone: "success",
        text: "Mindmap обновлена и сохранена в блокноте.",
      });
      await queryClient.invalidateQueries({
        queryKey: notebookKeys.detail(notebookId),
      });
    },
    onError: (error) => {
      setNotice({
        tone: "error",
        text: getErrorMessage(error, "Не удалось построить mindmap"),
      });
    },
  });

  const flashcardsMutation = useMutation({
    mutationKey: notebookKeys.flashcards(),
    mutationFn: () =>
      notebookApi.flashcards(notebookId, { count: flashcardsCount }),
    onSuccess: async () => {
      setNotice({
        tone: "success",
        text: "Карточки обновлены. Можно сразу посмотреть новый набор.",
      });
      await queryClient.invalidateQueries({
        queryKey: notebookKeys.detail(notebookId),
      });
    },
    onError: (error) => {
      setNotice({
        tone: "error",
        text: getErrorMessage(error, "Не удалось сгенерировать карточки"),
      });
    },
  });

  const podcastMutation = useMutation({
    mutationKey: notebookKeys.podcast(),
    mutationFn: () => notebookApi.podcast(notebookId, { tone: podcastTone }),
    onSuccess: async () => {
      setNotice({
        tone: "success",
        text: "Подкаст обновлен. Если генерация длилась дольше, просто обнови страницу еще раз чуть позже.",
      });
      await queryClient.invalidateQueries({
        queryKey: notebookKeys.detail(notebookId),
      });
    },
    onError: (error) => {
      setNotice({
        tone: "error",
        text: getErrorMessage(error, "Не удалось сгенерировать подкаст"),
      });
    },
  });

  const uploadSourceMutation = useMutation({
    mutationFn: async (files: File[]) => {
      for (const file of files) {
        await notebookApi.uploadSource(notebookId, file);
      }
    },
    onSuccess: async (_, files) => {
      setNotice({
        tone: "success",
        text: `Добавлено файлов: ${files.length}. Источники обновлены.`,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notebookKeys.list() }),
        queryClient.invalidateQueries({
          queryKey: notebookKeys.detail(notebookId),
        }),
      ]);
    },
    onError: (error) => {
      setNotice({
        tone: "error",
        text: getErrorMessage(error, "Не удалось загрузить файлы"),
      });
    },
  });

  const removeSourceMutation = useMutation({
    mutationFn: (sourceId: string) =>
      notebookApi.removeSource(notebookId, sourceId),
    onSuccess: async () => {
      setNotice({
        tone: "success",
        text: "Источник удален из блокнота.",
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notebookKeys.list() }),
        queryClient.invalidateQueries({
          queryKey: notebookKeys.detail(notebookId),
        }),
      ]);
    },
    onError: (error) => {
      setNotice({
        tone: "error",
        text: getErrorMessage(error, "Не удалось удалить источник"),
      });
    },
  });

  const mindmap = useMemo(
    () => normalizeMindmap(notebook?.mindmap),
    [notebook?.mindmap],
  );
  const flashcards = useMemo(
    () => normalizeFlashcards(notebook?.flashcards),
    [notebook?.flashcards],
  );
  const podcastScript = useMemo(
    () => normalizePodcastScript(notebook?.podcast_script),
    [notebook?.podcast_script],
  );
  const podcastUrl = useMemo(
    () => getPodcastUrl(notebook?.podcast_url),
    [notebook?.podcast_url],
  );

  const artifactStats = [
    {
      label: "Источники",
      value: notebook?.sources.length ?? 0,
    },
    {
      label: "Саммари",
      value: notebook?.summary ? "Готово" : "Пусто",
    },
    {
      label: "Подкаст",
      value: podcastUrl ? "Есть" : "Нет",
    },
  ];

  const handleFilesSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    await uploadSourceMutation.mutateAsync(files);
    event.target.value = "";
  };

  return (
    <section className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1440px] gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <main className="space-y-6">
          <Card className="border-none bg-[linear-gradient(180deg,var(--card),color-mix(in_oklab,var(--accent)_52%,var(--card)))] ring-1 ring-border/80">
            <CardHeader className="gap-5 lg:flex lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Sparkles className="size-3.5 text-primary" />
                  Блокнот
                </div>
                {notebookQuery.isPending ? (
                  <Skeleton className="mt-4 h-10 w-72 rounded-2xl" />
                ) : (
                  <CardTitle className="mt-4 text-4xl font-semibold tracking-tight text-[var(--text-h)]">
                    {notebook?.title ?? "Блокнот не найден"}
                  </CardTitle>
                )}
                <CardDescription className="mt-3 max-w-2xl text-base leading-7">
                  {notebook
                    ? "Здесь собрана вся информация по конкретному блокноту: источники, summary, mindmap, карточки и аудиорезультат."
                    : "Загружаю содержимое блокнота и производные артефакты."}
                </CardDescription>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {artifactStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border bg-card px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-[var(--text-h)]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {notice ? (
                <div
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm leading-6",
                    notice.tone === "success"
                      ? "border-primary/30 bg-primary/8 text-foreground"
                      : "border-destructive/30 bg-destructive/10 text-destructive",
                  )}
                >
                  {notice.text}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                  {notebook
                    ? `Создан ${formatDate(notebook.created_at)}. Все артефакты здесь привязаны к одному набору источников.`
                    : "Загружаю данные по блокноту..."}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link to="/notebooks">
                    <FolderPlus className="size-4" />
                    Новый блокнот
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void notebookQuery.refetch()}
                  type="button"
                >
                  <RefreshCw className="size-4" />
                  Обновить
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="ring-1 ring-border/80">
            <CardHeader>
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as NotebookTab)}
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
              {notebookQuery.isPending ? (
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
                        Краткая выжимка по текущим источникам. Можно
                        перегенерировать в другом стиле.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <select
                        className="h-11 rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none"
                        onChange={(event) =>
                          setSummaryStyle(
                            event.target
                              .value as (typeof summaryStyles)[number],
                          )
                        }
                        value={summaryStyle}
                      >
                        {summaryStyles.map((style) => (
                          <option key={style} value={style}>
                            {style}
                          </option>
                        ))}
                      </select>
                      <Button
                        disabled={summaryMutation.isPending}
                        onClick={() => void summaryMutation.mutateAsync()}
                        type="button"
                      >
                        {summaryMutation.isPending ? (
                          <Spinner />
                        ) : (
                          "Обновить саммари"
                        )}
                      </Button>
                    </div>
                  </div>

                  {notebook.summary ? (
                    <div className="rounded-3xl border border-border bg-card px-6 py-5">
                      <div className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                        {notebook.summary}
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
                      disabled={mindmapMutation.isPending}
                      onClick={() => void mindmapMutation.mutateAsync()}
                      type="button"
                    >
                      {mindmapMutation.isPending ? (
                        <Spinner />
                      ) : (
                        "Обновить mindmap"
                      )}
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
                        Набор карточек для быстрого повторения по материалам
                        блокнота.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Input
                        className="w-28"
                        max={50}
                        min={1}
                        onChange={(event) =>
                          setFlashcardsCount(Number(event.target.value) || 1)
                        }
                        type="number"
                        value={flashcardsCount}
                      />
                      <Button
                        disabled={flashcardsMutation.isPending}
                        onClick={() => void flashcardsMutation.mutateAsync()}
                        type="button"
                      >
                        {flashcardsMutation.isPending ? (
                          <Spinner />
                        ) : (
                          "Обновить карточки"
                        )}
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
                          setPodcastTone(
                            event.target.value as (typeof podcastTones)[number],
                          )
                        }
                        value={podcastTone}
                      >
                        {podcastTones.map((tone) => (
                          <option key={tone} value={tone}>
                            {tone}
                          </option>
                        ))}
                      </select>
                      <Button
                        disabled={podcastMutation.isPending}
                        onClick={() => void podcastMutation.mutateAsync()}
                        type="button"
                      >
                        {podcastMutation.isPending ? (
                          <Spinner />
                        ) : (
                          "Обновить подкаст"
                        )}
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
        </main>

        <aside className="space-y-6">
          <Card className="ring-1 ring-border/80">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--text-h)]">
                Источники
              </CardTitle>
              <CardDescription>
                Материалы, на которых построен текущий блокнот и все его
                артефакты.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/35 px-5 py-8 text-center transition-colors",
                  notebookQuery.isPending && "cursor-progress opacity-70",
                )}
              >
                <Upload className="size-8 text-primary" />
                <p className="mt-4 text-sm font-semibold text-[var(--text-h)]">
                  Добавить документы
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Загрузишь новые материалы — и detail page покажет обновленные
                  данные после генерации.
                </p>
                <input
                  className="hidden"
                  disabled={uploadSourceMutation.isPending}
                  multiple
                  onChange={(event) => void handleFilesSelected(event)}
                  type="file"
                />
              </label>

              {notebookQuery.isPending ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full rounded-2xl" />
                  <Skeleton className="h-16 w-full rounded-2xl" />
                </div>
              ) : notebook && notebook.sources.length > 0 ? (
                <div className="space-y-3">
                  {notebook.sources.map((source) => (
                    <div
                      key={source.id}
                      className="rounded-2xl border border-border bg-card px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[var(--text-h)]">
                            {source.filename}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {source.chunks_count} чанков •{" "}
                            {formatDate(source.created_at)}
                          </p>
                        </div>
                        <Button
                          className="size-8 rounded-full"
                          disabled={removeSourceMutation.isPending}
                          onClick={() =>
                            void removeSourceMutation.mutateAsync(source.id)
                          }
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="size-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ArtifactPlaceholder
                  title="Источники пока не загружены"
                  description="Добавь хотя бы один документ, чтобы блокнот начал накапливать summary, mindmap, карточки и подкаст."
                />
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}
