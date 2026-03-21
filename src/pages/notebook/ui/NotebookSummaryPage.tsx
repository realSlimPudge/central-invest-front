import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import { type SummaryStyle } from "@/features/notebook-artifacts/model/notebook-artifacts";
import { NotebookSummaryTab } from "@/features/notebook-summary/ui/NotebookSummaryTab";
import { getNotebookErrorMessage } from "@/features/notebook-workspace/lib/notebook-ui";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";

export function NotebookSummaryPage() {
  const queryClient = useQueryClient();
  const { notebookId, notebook } = useNotebookRoute();
  const [summaryStyle, setSummaryStyle] = useState<SummaryStyle>("official");

  const summaryMutation = useMutation({
    mutationKey: notebookKeys.summary(),
    mutationFn: () => notebookApi.summary(notebookId, { style: summaryStyle }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notebookKeys.detail(notebookId),
      });
      toast.success("Саммари обновлено");
    },
    onError: (error) => {
      toast.error(getNotebookErrorMessage(error, "Не удалось обновить саммари"));
    },
  });

  return (
    <NotebookSummaryTab
      isPending={summaryMutation.isPending}
      onGenerate={() => void summaryMutation.mutateAsync()}
      onSummaryStyleChange={setSummaryStyle}
      summary={notebook?.summary}
      summaryStyle={summaryStyle}
    />
  );
}
