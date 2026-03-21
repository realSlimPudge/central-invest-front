import { createFileRoute } from "@tanstack/react-router";

import { NotebookOverviewPage } from "@/pages/notebook/ui/NotebookOverviewPage";

export const Route = createFileRoute("/notebooks/$id/")({
  component: NotebookOverviewPage,
});
