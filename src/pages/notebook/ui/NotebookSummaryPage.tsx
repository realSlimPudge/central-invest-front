import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import { type SummaryStyle } from "@/features/notebook-artifacts/model/notebook-artifacts";
import { NotebookSummaryTab } from "@/features/notebook-summary/ui/NotebookSummaryTab";
import { runNotebookRequestWithToast } from "@/features/notebook-workspace/lib/notebook-ui";
import { getNotebookModuleAvailability } from "@/features/notebook-workspace/model/notebook-module-availability";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";
import { NotebookModuleUnavailable } from "@/features/notebook-workspace/ui/NotebookModuleUnavailable";

export function NotebookSummaryPage() {
  const queryClient = useQueryClient();
  const { notebookId, notebook } = useNotebookRoute();
  const moduleAvailability = getNotebookModuleAvailability(notebook, "summary");
  const [summaryStyle, setSummaryStyle] = useState<SummaryStyle>("official");

  const summaryMutation = useMutation({
    mutationKey: notebookKeys.summary(),
    mutationFn: () => notebookApi.summary(notebookId, { style: summaryStyle }),
  });

  const handleGenerate = async () =>
    runNotebookRequestWithToast({
      request: summaryMutation.mutateAsync().then(async (result) => {
        await queryClient.invalidateQueries({
          queryKey: notebookKeys.detail(notebookId),
        });
        return result;
      }),
      loading: "Формируем саммари...",
      success: "Саммари обновлено",
      error: "Не удалось обновить саммари",
    });

  if (!moduleAvailability.enabled) {
    return (
      <NotebookModuleUnavailable
        notebookId={notebookId}
        reason={moduleAvailability.reason ?? "Модуль временно недоступен."}
        title="Саммари"
      />
    );
  }

  return (
    <NotebookSummaryTab
      isPending={summaryMutation.isPending}
      onGenerate={() => void handleGenerate()}
      onSummaryStyleChange={setSummaryStyle}
      summary={notebook?.summary}
      summaryStyle={summaryStyle}
    />
  );
}
