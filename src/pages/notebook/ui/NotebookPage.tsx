import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import { FolderPlus, RefreshCw, Sparkles, Trash2, Upload } from "lucide-react";
import { type ChangeEvent, useState } from "react";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import { notebookOptions } from "@/entities/notebook/api/notebook.options";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import {
  ArtifactPlaceholder,
  NotebookTabs,
  type NotebookTab,
  type PodcastTone,
  type SummaryStyle,
} from "./NotebookTabs";

type Notice = {
  tone: "success" | "error";
  text: string;
};

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

const notebookRouteApi = getRouteApi("/notebooks/$id");

export function NotebookPage() {
  const { id: notebookId } = notebookRouteApi.useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<NotebookTab>("summary");
  const [summaryStyle, setSummaryStyle] = useState<SummaryStyle>("official");
  const [flashcardsCount, setFlashcardsCount] = useState(10);
  const [podcastTone, setPodcastTone] = useState<PodcastTone>("popular");
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
      value: notebook?.podcast_url ? "Есть" : "Нет",
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

          <NotebookTabs
            activeTab={activeTab}
            flashcardsCount={flashcardsCount}
            isFlashcardsPending={flashcardsMutation.isPending}
            isMindmapPending={mindmapMutation.isPending}
            isPending={notebookQuery.isPending}
            isPodcastPending={podcastMutation.isPending}
            isSummaryPending={summaryMutation.isPending}
            notebook={notebook}
            onFlashcardsCountChange={setFlashcardsCount}
            onGenerateFlashcards={() => void flashcardsMutation.mutateAsync()}
            onGenerateMindmap={() => void mindmapMutation.mutateAsync()}
            onGeneratePodcast={() => void podcastMutation.mutateAsync()}
            onGenerateSummary={() => void summaryMutation.mutateAsync()}
            onPodcastToneChange={setPodcastTone}
            onSummaryStyleChange={setSummaryStyle}
            onTabChange={setActiveTab}
            podcastTone={podcastTone}
            summaryStyle={summaryStyle}
          />
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
