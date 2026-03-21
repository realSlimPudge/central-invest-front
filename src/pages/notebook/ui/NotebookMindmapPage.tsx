import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import { NotebookMindmapTab } from "@/features/notebook-mindmap/ui/NotebookMindmapTab";
import { getNotebookErrorMessage } from "@/features/notebook-workspace/lib/notebook-ui";
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notebookKeys.detail(notebookId),
      });
      toast.success("Майнд-карта обновлена");
    },
    onError: (error) => {
      toast.error(
        getNotebookErrorMessage(error, "Не удалось построить майнд-карту"),
      );
    },
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
      onGenerate={() => void mindmapMutation.mutateAsync()}
    />
  );
}
