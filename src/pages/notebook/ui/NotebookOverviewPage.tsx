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

import {
  getNotebookModuleAvailabilityMap,
  type NotebookModuleId,
} from "@/features/notebook-workspace/model/notebook-module-availability";

import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";

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
    <div className="space-y-6">
      <NotebookModuleHeader
        description="Быстрый срез по блокноту: что уже готово, куда перейти дальше и на каких материалах все строится."
        title="Обзор"
      />

      <div className="grid gap-6">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
          </div>
          <NotebookModuleHeader
            description="Быстрый срез того, что уже собрано по этому блокноту."
            title="Готовность модулей"
          />

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
          </div>
        </div>
      </div>
    </div>
  );
}
