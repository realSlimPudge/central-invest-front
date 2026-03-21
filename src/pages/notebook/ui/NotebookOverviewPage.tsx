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
  formatNotebookDate,
  getContourDescription,
  getContourLabel,
  getSourceStatusLabel,
  getSourceStatusTone,
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
    title: "Загрузить материалы",
    description: "Добавь документы, таблицы или медиа в блокнот.",
    to: "/notebooks/$id/sources",
    icon: FolderOpen,
  },
  {
    title: "Запустить чат",
    description: "Спроси по документам и получи ответ со стримом.",
    to: "/notebooks/$id/chat",
    icon: MessageSquareText,
  },
  {
    title: "Собрать саммари",
    description: "Сделай краткую выжимку по текущему набору источников.",
    to: "/notebooks/$id/summary",
    icon: BookOpenText,
  },
  {
    title: "Построить карту",
    description: "Разверни темы и связи в визуальную структуру.",
    to: "/notebooks/$id/mindmap",
    icon: GitBranchPlus,
  },
  {
    title: "Подготовить карточки",
    description: "Сделай учебный режим для быстрого повторения.",
    to: "/notebooks/$id/flashcards",
    icon: BrainCircuit,
  },
  {
    title: "Собрать подкаст",
    description: "Сгенерируй аудиоверсию и сценарий по документам.",
    to: "/notebooks/$id/podcast",
    icon: AudioLines,
  },
];

export function NotebookOverviewPage() {
  const { notebookId, notebook } = useNotebookRoute();

  const readiness = [
    {
      label: "Саммари",
      value: Boolean(notebook?.summary),
      to: "/notebooks/$id/summary",
      icon: BookOpenText,
    },
    {
      label: "Майнд-карта",
      value: Boolean(notebook?.mindmap),
      to: "/notebooks/$id/mindmap",
      icon: GitBranchPlus,
    },
    {
      label: "Карточки",
      value: Boolean(notebook?.flashcards),
      to: "/notebooks/$id/flashcards",
      icon: BrainCircuit,
    },
    {
      label: "Подкаст",
      value: Boolean(notebook?.podcast_url),
      to: "/notebooks/$id/podcast",
      icon: AudioLines,
    },
    {
      label: "Договор",
      value: Boolean(notebook?.contract),
      to: "/notebooks/$id/contract",
      icon: ScrollText,
    },
    {
      label: "Граф знаний",
      value: Boolean(notebook?.knowledge_graph),
      to: "/notebooks/$id/knowledge-graph",
      icon: Network,
    },
    {
      label: "Таймлайн",
      value: Boolean(notebook?.timeline),
      to: "/notebooks/$id/timeline",
      icon: TimerReset,
    },
    {
      label: "Вопросы",
      value: Boolean(notebook?.questions),
      to: "/notebooks/$id/questions",
      icon: MessageSquareText,
    },
    {
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
            {quickActions.map(({ title, description, to, icon: Icon }) => (
              <Link
                key={to}
                params={{ id: notebookId }}
                resetScroll={false}
                to={to}
              >
                <div className="group h-full rounded-3xl border border-border bg-card px-5 py-5 transition-colors hover:bg-muted/50">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-[var(--text-h)]">
                    <Icon className="size-5" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-[var(--text-h)]">
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </div>
              </Link>
            ))}
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
            {readiness.map(({ label, value, to, icon: Icon }) => (
              <Link
                key={to}
                params={{ id: notebookId }}
                resetScroll={false}
                to={to}
              >
                <div className="rounded-2xl border border-border bg-card px-4 py-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-h)]">
                        {label}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {value ? "Готово" : "Пока пусто"}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-2xl border",
                        value
                          ? "border-primary/20 bg-primary/10 text-foreground"
                          : "border-border bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
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
              Контур, последние загрузки и оперативная картина по материалам.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/40 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Контур обработки
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
              Последние материалы, на которых строится весь workspace.
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
                          {source.chunks_count} чанков •{" "}
                          {formatNotebookDate(source.created_at)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs",
                          getSourceStatusTone(source.status),
                        )}
                      >
                        {getSourceStatusLabel(source.status)}
                      </span>
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
                description="Начни с загрузки документов или аудио, и блокнот сразу станет полезным рабочим пространством."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
