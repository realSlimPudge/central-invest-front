import { createFileRoute } from "@tanstack/react-router";

import { NotebookKnowledgeGraphPage } from "@/pages/notebook/ui/NotebookKnowledgeGraphPage";

export const Route = createFileRoute("/notebooks/$id/knowledge-graph")({
  component: NotebookKnowledgeGraphPage,
});
