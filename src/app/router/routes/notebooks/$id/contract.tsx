import { createFileRoute } from "@tanstack/react-router";

import { NotebookContractPage } from "@/pages/notebook/ui/NotebookContractPage";

export const Route = createFileRoute("/notebooks/$id/contract")({
  component: NotebookContractPage,
});
