import { createFileRoute } from "@tanstack/react-router";

import { notebookOptions } from "@/entities/notebook/api/notebook.options";
import { NotebookWorkspaceLayout } from "@/features/notebook-workspace/ui/NotebookWorkspaceLayout";

export const Route = createFileRoute("/notebooks/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(notebookOptions.detail(params.id)),
  component: NotebookWorkspaceLayout,
});
