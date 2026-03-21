import type {
  Notebook,
  NotebookSource,
} from "@/entities/notebook/api/dto/notebook.types";

export function formatNotebookDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getNotebookErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function getNotebookFilledArtifactsCount(
  notebook: Notebook | undefined,
) {
  if (!notebook) {
    return 0;
  }

  return [
    notebook.summary,
    notebook.mindmap,
    notebook.flashcards,
    notebook.podcast_url,
    notebook.contract,
    notebook.knowledge_graph,
    notebook.timeline,
    notebook.questions,
    notebook.presentation,
  ].filter(Boolean).length;
}

export function getReadySourcesCount(sources: NotebookSource[]) {
  return sources.filter((source) => !source.status || source.status === "ready")
    .length;
}

export function getSourceStatusLabel(status?: string) {
  switch (status) {
    case "processing":
      return "Обрабатывается";
    case "error":
      return "Ошибка";
    case "ready":
    default:
      return "Готов";
  }
}

export function getSourceStatusTone(status?: string) {
  switch (status) {
    case "processing":
      return "border-primary/30 bg-primary/10 text-foreground";
    case "error":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "ready":
    default:
      return "border-border bg-muted/40 text-foreground";
  }
}

export function shouldShowSourceStatusBadge(status?: string) {
  return status !== "processing";
}

export function getContourLabel(contour?: string) {
  return contour === "closed" ? "Закрытый режим" : "Стандартный режим";
}

export function getContourDescription(contour?: string) {
  return contour === "closed"
    ? "Подходит, когда нужен более закрытый режим работы с материалами."
    : "Подходит для повседневной работы с блокнотом.";
}
