import { createFileRoute } from "@tanstack/react-router";

import { NotebookSummaryPage } from "@/pages/notebook/ui/NotebookSummaryPage";

export const Route = createFileRoute("/notebooks/$id/summary")({
  component: NotebookSummaryPage,
});
