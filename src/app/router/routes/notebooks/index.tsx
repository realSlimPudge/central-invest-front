import { CreateNotebookPage } from "@/pages/notebook/ui/CreateNotebook";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/notebooks/")({
  component: CreateNotebookPage,
});
