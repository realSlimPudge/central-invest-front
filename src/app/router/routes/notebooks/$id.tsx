import { notebookOptions } from "@/entities/notebook/api/notebook.options";
import { NotebookRoutePage } from "@/pages/notebook/ui/NotebookRoutePage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/notebooks/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(notebookOptions.detail(params.id)),
  component: NotebookRoutePage,
});
