import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TimerReset } from "lucide-react";
import { toast } from "sonner";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import type {
  NotebookTimeline,
  NotebookTimelineEvent,
} from "@/entities/notebook/api/dto/notebook.types";
import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import { getNotebookErrorMessage } from "@/features/notebook-workspace/lib/notebook-ui";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

function asTimeline(
  value: NotebookTimeline | Record<string, unknown> | null | undefined,
) {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as NotebookTimeline;
}

function getEventTone(type?: string) {
  switch (type) {
    case "payment":
      return "border-primary/20 bg-primary/10";
    case "deadline":
      return "border-destructive/20 bg-destructive/10";
    case "agreement":
      return "border-border bg-muted/40";
    default:
      return "border-border bg-card";
  }
}

export function NotebookTimelinePage() {
  const queryClient = useQueryClient();
  const { notebookId, notebook } = useNotebookRoute();
  const timeline = asTimeline(notebook?.timeline);
  const events = Array.isArray(timeline?.events)
    ? (timeline?.events as NotebookTimelineEvent[])
    : [];

  const timelineMutation = useMutation({
    mutationKey: notebookKeys.timeline(),
    mutationFn: () => notebookApi.timeline(notebookId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notebookKeys.detail(notebookId),
      });
      toast.success("Таймлайн обновлен");
    },
    onError: (error) => {
      toast.error(
        getNotebookErrorMessage(error, "Не удалось построить таймлайн"),
      );
    },
  });

  return (
    <div className="space-y-6">
      <NotebookModuleHeader
        actions={
          <Button
            disabled={timelineMutation.isPending}
            onClick={() => void timelineMutation.mutateAsync()}
            type="button"
          >
            <TimerReset className="size-4" />
            {events.length > 0 ? "Обновить таймлайн" : "Построить таймлайн"}
          </Button>
        }
        description="Хронология событий, дедлайнов, платежей и ключевых дат, извлеченных из документов."
        title="Временная шкала"
      />

      {events.length > 0 ? (
        <Card className="ring-1 ring-border/80">
          <CardContent className="p-6">
            <div className="space-y-6">
              {events.map((event, index) => (
                <div
                  key={`${event.date}-${event.title}-${index}`}
                  className="relative pl-8"
                >
                  {index < events.length - 1 && (
                    <span className="absolute left-3 top-10 h-[calc(100%+1rem)] w-px bg-border" />
                  )}
                  <span className="absolute left-0 top-2 size-6 rounded-full border border-primary/20 bg-primary/10" />
                  <div
                    className={cn(
                      "rounded-3xl border px-5 py-5",
                      getEventTone(event.type),
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold text-[var(--text-h)]">
                        {event.title}
                      </p>
                      <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                        {event.type || "event"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-muted-foreground">
                      {event.date}
                    </p>
                    {event.description && (
                      <p className="mt-3 text-sm leading-7 text-foreground">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : notebook?.timeline ? (
        <Card className="ring-1 ring-border/80">
          <CardContent className="p-6">
            <pre className="overflow-x-auto text-sm leading-6 text-muted-foreground">
              {JSON.stringify(notebook.timeline, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <ArtifactPlaceholder
          title="Таймлайн пока не собран"
          description="Запусти анализ, чтобы получить хронологию событий и быстро увидеть, где находятся ключевые даты и дедлайны."
        />
      )}
    </div>
  );
}
