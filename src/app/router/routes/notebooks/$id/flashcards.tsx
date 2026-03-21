import { createFileRoute } from "@tanstack/react-router";

import { NotebookFlashcardsPage } from "@/pages/notebook/ui/NotebookFlashcardsPage";

export const Route = createFileRoute("/notebooks/$id/flashcards")({
  component: NotebookFlashcardsPage,
});
