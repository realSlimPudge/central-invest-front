import { Link } from "@tanstack/react-router";
import {
  AudioLines,
  BookOpenText,
  BrainCircuit,
  FolderOpen,
  GitBranchPlus,
  MessageSquareText,
  Network,
  Presentation,
  ScrollText,
  TimerReset,
} from "lucide-react";

import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import {
  getNotebookModuleAvailabilityMap,
  type NotebookModuleId,
} from "@/features/notebook-workspace/model/notebook-module-availability";
import {
  formatNotebookDate,
  getContourDescription,
  getContourLabel,
  getSourceStatusLabel,
  getSourceStatusTone,
  shouldShowSourceStatusBadge,
} from "@/features/notebook-workspace/lib/notebook-ui";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

const quickActions = [
  {
    module: "sources" as NotebookModuleId,
    title: "Загрузить материалы",
    description: "Добавь документы, таблицы или медиа в блокнот.",
    to: "/notebooks/$id/sources",
    icon: FolderOpen,
  },
  {
    module: "chat" as NotebookModuleId,
    title: "Запустить чат",
    description: "Спроси по документам и получи ответ в диалоге.",
    to: "/notebooks/$id/chat",
    icon: MessageSquareText,
  },
  {
    module: "summary" as NotebookModuleId,
    title: "Собрать саммари",
    description: "Сделай краткую выжимку по текущему набору источников.",
    to: "/notebooks/$id/summary",
    icon: BookOpenText,
  },
  {
    module: "mindmap" as NotebookModuleId,
    title: "Построить карту",
    description: "Разверни темы и связи в визуальную структуру.",
    to: "/notebooks/$id/mindmap",
    icon: GitBranchPlus,
  },
  {
    module: "flashcards" as NotebookModuleId,
    title: "Подготовить карточки",
    description: "Сделай учебный режим для быстрого повторения.",
    to: "/notebooks/$id/flashcards",
    icon: BrainCircuit,
  },
  {
    module: "podcast" as NotebookModuleId,
    title: "Собрать подкаст",
    description: "Сгенерируй аудиоверсию и сценарий по документам.",
    to: "/notebooks/$id/podcast",
    icon: AudioLines,
  },
];

export function NotebookOverviewPage() {
  const { notebookId, notebook } = useNotebookRoute();
  const moduleAvailability = getNotebookModuleAvailabilityMap(notebook);

  const readiness = [
    {
      module: "summary" as NotebookModuleId,
      label: "Саммари",
      value: Boolean(notebook?.summary),
      to: "/notebooks/$id/summary",
      icon: BookOpenText,
    },
    {
      module: "mindmap" as NotebookModuleId,
      label: "Майнд-карта",
      value: Boolean(notebook?.mindmap),
      to: "/notebooks/$id/mindmap",
      icon: GitBranchPlus,
    },
    {
      module: "flashcards" as NotebookModuleId,
      label: "Карточки",
      value: Boolean(notebook?.flashcards),
      to: "/notebooks/$id/flashcards",
      icon: BrainCircuit,
    },
    {
      module: "podcast" as NotebookModuleId,
      label: "Подкаст",
      value: Boolean(notebook?.podcast_url),
      to: "/notebooks/$id/podcast",
      icon: AudioLines,
    },
    {
      module: "contract" as NotebookModuleId,
      label: "Договор",
      value: Boolean(notebook?.contract),
      to: "/notebooks/$id/contract",
      icon: ScrollText,
    },
    {
      module: "knowledge-graph" as NotebookModuleId,
      label: "Граф знаний",
      value: Boolean(notebook?.knowledge_graph),
      to: "/notebooks/$id/knowledge-graph",
      icon: Network,
    },
    {
      module: "timeline" as NotebookModuleId,
      label: "Таймлайн",
      value: Boolean(notebook?.timeline),
      to: "/notebooks/$id/timeline",
      icon: TimerReset,
    },
    {
      module: "questions" as NotebookModuleId,
      label: "Вопросы",
      value: Boolean(notebook?.questions),
      to: "/notebooks/$id/questions",
      icon: MessageSquareText,
    },
    {
      module: "presentation" as NotebookModuleId,
      label: "Презентация",
      value: Boolean(notebook?.presentation),
      to: "/notebooks/$id/presentation",
      icon: Presentation,
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
      <div className="space-y-6">
        <Card className="ring-1 ring-border/80">
          <CardHeader>
            <CardTitle className="text-2xl text-[var(--text-h)]">
              Рабочий сценарий
            </CardTitle>
            <CardDescription className="text-base leading-7">
              Сначала собери материалы, потом задавай вопросы и переключайся
              между артефактами. Один блокнот — единый контекст для всех
              экранов.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quickActions.map(
              ({ module, title, description, to, icon: Icon }) => {
                const availability = moduleAvailability[module];
                const content = (
                  <div
                    className={cn(
                      "group h-full rounded-3xl border px-5 py-5 transition-colors",
                      availability.enabled
                        ? "border-border bg-card hover:bg-muted/50"
                        : "border-dashed border-border bg-muted/20 opacity-70",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-11 items-center justify-center rounded-2xl bg-muted text-[var(--text-h)]",
                        !availability.enabled && "text-muted-foreground",
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <p className="text-lg font-semibold text-[var(--text-h)]">
                        {title}
                      </p>
                      {!availability.enabled ? (
                        <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                          Недоступно
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {availability.enabled
                        ? description
                        : (availability.reason ?? description)}
                    </p>
                  </div>
                );

                if (!availability.enabled) {
                  return <div key={to}>{content}</div>;
                }

                return (
                  <Link
                    key={to}
                    params={{ id: notebookId }}
                    resetScroll={false}
                    to={to}
                  >
                    {content}
                  </Link>
                );
              },
            )}
          </CardContent>
        </Card>

        <Card className="ring-1 ring-border/80">
          <CardHeader>
            <CardTitle className="text-2xl text-[var(--text-h)]">
              Готовность модулей
            </CardTitle>
            <CardDescription>
              Быстрый срез того, что уже собрано по этому блокноту.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {readiness.map(({ module, label, value, to, icon: Icon }) => {
              const availability = moduleAvailability[module];
              const content = (
                <div
                  className={cn(
                    "rounded-2xl border px-4 py-4 transition-colors",
                    availability.enabled
                      ? "border-border bg-card hover:bg-muted/50"
                      : "border-dashed border-border bg-muted/20 opacity-70",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-h)]">
                        {label}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {availability.enabled
                          ? value
                            ? "Готово"
                            : "Пока пусто"
                          : "Недоступно"}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-2xl border",
                        availability.enabled && value
                          ? "border-primary/20 bg-primary/10 text-foreground"
                          : "border-border bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                  </div>
                </div>
              );

              if (!availability.enabled) {
                return <div key={to}>{content}</div>;
              }

              return (
                <Link
                  key={to}
                  params={{ id: notebookId }}
                  resetScroll={false}
                  to={to}
                >
                  {content}
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="ring-1 ring-border/80">
          <CardHeader>
            <CardTitle className="text-xl text-[var(--text-h)]">
              Состояние блокнота
            </CardTitle>
            <CardDescription>
              Текущий режим, последние загрузки и общая картина по материалам.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/40 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Режим работы
              </p>
              <p className="mt-2 font-semibold text-[var(--text-h)]">
                {getContourLabel(notebook?.contour)}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {getContourDescription(notebook?.contour)}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Последнее обновление
              </p>
              <p className="mt-2 font-semibold text-[var(--text-h)]">
                {notebook ? formatNotebookDate(notebook.created_at) : "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="ring-1 ring-border/80">
          <CardHeader>
            <CardTitle className="text-xl text-[var(--text-h)]">
              Источники
            </CardTitle>
            <CardDescription>
              Последние материалы, на которых строится весь блокнот.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notebook && notebook.sources.length > 0 ? (
              <div className="space-y-3">
                {notebook.sources.slice(0, 5).map((source) => (
                  <div
                    key={source.id}
                    className="rounded-2xl border border-border bg-card px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--text-h)]">
                          {source.filename}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {source.chunks_count} фрагментов •{" "}
                          {formatNotebookDate(source.created_at)}
                        </p>
                      </div>
                      {shouldShowSourceStatusBadge(source.status) ? (
                        <span
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs",
                            getSourceStatusTone(source.status),
                          )}
                        >
                          {getSourceStatusLabel(source.status)}
                        </span>
                      ) : null}
                    </div>
                    {source.error && (
                      <p className="mt-3 text-sm text-destructive">
                        {source.error}
                      </p>
                    )}
                  </div>
                ))}

                <Button asChild className="w-full" variant="outline">
                  <Link
                    params={{ id: notebookId }}
                    resetScroll={false}
                    to="/notebooks/$id/sources"
                  >
                    Перейти к источникам
                  </Link>
                </Button>
              </div>
            ) : (
              <ArtifactPlaceholder
                title="Источники пока не добавлены"
                description="Начни с загрузки документов или записей, и блокнот сразу станет полезным инструментом для работы."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
