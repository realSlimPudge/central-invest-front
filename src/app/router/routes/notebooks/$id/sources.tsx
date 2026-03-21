import { createFileRoute } from "@tanstack/react-router";

import { NotebookSourcesPage } from "@/pages/notebook/ui/NotebookSourcesPage";

export const Route = createFileRoute("/notebooks/$id/sources")({
  component: NotebookSourcesPage,
});
