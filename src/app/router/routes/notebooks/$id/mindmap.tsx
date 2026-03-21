import { createFileRoute } from "@tanstack/react-router";

import { NotebookMindmapPage } from "@/pages/notebook/ui/NotebookMindmapPage";

export const Route = createFileRoute("/notebooks/$id/mindmap")({
  component: NotebookMindmapPage,
});
