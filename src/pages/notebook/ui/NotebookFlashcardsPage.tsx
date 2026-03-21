import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import { NotebookFlashcardsTab } from "@/features/notebook-flashcards/ui/NotebookFlashcardsTab";
import { getNotebookErrorMessage } from "@/features/notebook-workspace/lib/notebook-ui";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";

export function NotebookFlashcardsPage() {
  const queryClient = useQueryClient();
  const { notebookId, notebook } = useNotebookRoute();
  const [flashcardsCount, setFlashcardsCount] = useState(10);

  const flashcardsMutation = useMutation({
    mutationKey: notebookKeys.flashcards(),
    mutationFn: () => notebookApi.flashcards(notebookId, { count: flashcardsCount }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notebookKeys.detail(notebookId),
      });
      toast.success("Карточки обновлены");
    },
    onError: (error) => {
      toast.error(
        getNotebookErrorMessage(error, "Не удалось сгенерировать карточки"),
      );
    },
  });

  return (
    <NotebookFlashcardsTab
      flashcards={notebook?.flashcards}
      flashcardsCount={flashcardsCount}
      isPending={flashcardsMutation.isPending}
      onFlashcardsCountChange={setFlashcardsCount}
      onGenerate={() => void flashcardsMutation.mutateAsync()}
    />
  );
}
