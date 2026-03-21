import { createFileRoute } from "@tanstack/react-router";

import { NotebookTimelinePage } from "@/pages/notebook/ui/NotebookTimelinePage";

export const Route = createFileRoute("/notebooks/$id/timeline")({
  component: NotebookTimelinePage,
});
