import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import { NotebookMindmapTab } from "@/features/notebook-mindmap/ui/NotebookMindmapTab";
import { runNotebookRequestWithToast } from "@/features/notebook-workspace/lib/notebook-ui";
import { getNotebookModuleAvailability } from "@/features/notebook-workspace/model/notebook-module-availability";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";
import { NotebookModuleUnavailable } from "@/features/notebook-workspace/ui/NotebookModuleUnavailable";

export function NotebookMindmapPage() {
  const queryClient = useQueryClient();
  const { notebookId, notebook } = useNotebookRoute();
  const moduleAvailability = getNotebookModuleAvailability(notebook, "mindmap");

  const mindmapMutation = useMutation({
    mutationKey: notebookKeys.mindmap(),
    mutationFn: () => notebookApi.mindmap(notebookId),
  });

  const handleGenerate = async () =>
    runNotebookRequestWithToast({
      request: mindmapMutation.mutateAsync().then(async (result) => {
        await queryClient.invalidateQueries({
          queryKey: notebookKeys.detail(notebookId),
        });
        return result;
      }),
      loading: "Строим майнд-карту...",
      success: "Майнд-карта обновлена",
      error: "Не удалось построить майнд-карту",
    });

  if (!moduleAvailability.enabled) {
    return (
      <NotebookModuleUnavailable
        notebookId={notebookId}
        reason={moduleAvailability.reason ?? "Модуль временно недоступен."}
        title="Майнд-карта"
      />
    );
  }

  return (
    <NotebookMindmapTab
      isPending={mindmapMutation.isPending}
      mindmap={notebook?.mindmap}
      onGenerate={() => void handleGenerate()}
    />
  );
}
