import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import { getNotebookErrorMessage } from "@/features/notebook-workspace/lib/notebook-ui";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Spinner } from "@/shared/components/ui/spinner";

type DeleteNotebookModalProps = {
  notebookId: string;
  title: string;
};

const DeleteNotebookModal = NiceModal.create<DeleteNotebookModalProps>(
  ({ notebookId, title }) => {
    const modal = useModal();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const mutation = useMutation({
      mutationKey: [...notebookKeys.detail(notebookId), "delete"],
      mutationFn: () => notebookApi.delete(notebookId),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: notebookKeys.list() });
        await queryClient.removeQueries({ queryKey: notebookKeys.detail(notebookId) });
        toast.success("Блокнот удален");
        modal.hide();
        await navigate({ to: "/notebooks" });
      },
      onError: (error) => {
        toast.error(
          getNotebookErrorMessage(error, "Не удалось удалить блокнот"),
        );
      },
    });

    return (
      <Dialog
        onOpenChange={(open) => {
          if (!open) modal.hide();
        }}
        open={modal.visible}
      >
        <DialogContent
          onAnimationEnd={() => {
            if (!modal.visible) modal.remove();
          }}
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle>Удалить блокнот</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Блокнот «{title}» и связанные с ним
              материалы будут удалены.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button onClick={() => modal.hide()} type="button" variant="outline">
              Отмена
            </Button>
            <Button
              disabled={mutation.isPending}
              onClick={() => void mutation.mutateAsync()}
              type="button"
              variant="destructive"
            >
              {mutation.isPending ? <Spinner /> : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);

export default DeleteNotebookModal;
