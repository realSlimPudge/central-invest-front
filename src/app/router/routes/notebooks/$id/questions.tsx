import { createFileRoute } from "@tanstack/react-router";

import { NotebookQuestionsPage } from "@/pages/notebook/ui/NotebookQuestionsPage";

export const Route = createFileRoute("/notebooks/$id/questions")({
  component: NotebookQuestionsPage,
});
