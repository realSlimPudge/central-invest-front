import { createFileRoute } from "@tanstack/react-router";

import { NotebookPresentationPage } from "@/pages/notebook/ui/NotebookPresentationPage";

export const Route = createFileRoute("/notebooks/$id/presentation")({
  component: NotebookPresentationPage,
});
