import { notebookOptions } from "@/entities/notebook/api/notebook.options";
import { NotebookPage } from "@/pages/notebook/ui/NotebookPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/notebooks/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(notebookOptions.detail(params.id)),
  component: NotebookPage,
});
