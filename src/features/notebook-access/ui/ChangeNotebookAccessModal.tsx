import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import type { NotebookContour } from "@/entities/notebook/api/dto/notebook.types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Spinner } from "@/shared/components/ui/spinner";
import { useState } from "react";

type ChangeNotebookAccessModalProps = {
  notebookId: string;
  contour?: NotebookContour;
};

const accessOptions = [
  {
    value: "open",
    label: "Открытый доступ",
    description: "Блокнот работает в стандартном открытом режиме.",
  },
  {
    value: "closed",
    label: "Закрытый доступ",
    description: "Блокнот переводится в более закрытый режим работы.",
  },
] as const;

const ChangeNotebookAccessModal = NiceModal.create<ChangeNotebookAccessModalProps>(
  ({ notebookId, contour }) => {
    const modal = useModal();
    const queryClient = useQueryClient();
    const [value, setValue] = useState<NotebookContour>(contour ?? "open");

    const mutation = useMutation({
      mutationKey: [...notebookKeys.detail(notebookId), "access"],
      mutationFn: (nextContour: NotebookContour) =>
        notebookApi.setContour(notebookId, { contour: nextContour }),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: notebookKeys.list() }),
          queryClient.invalidateQueries({ queryKey: notebookKeys.detail(notebookId) }),
        ]);
        toast.success("Доступ к блокноту обновлен");
        modal.hide();
      },
      onError: (error) => {
        toast.error(
          getNotebookErrorMessage(error, "Не удалось обновить доступ к блокноту"),
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
            <DialogTitle>Изменить доступ</DialogTitle>
            <DialogDescription>
              Выбери режим доступа для текущего блокнота.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select onValueChange={(nextValue) => setValue(nextValue)} value={value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выбери доступ" />
              </SelectTrigger>
              <SelectContent>
                {accessOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
              <p className="text-sm font-medium text-foreground">
                {accessOptions.find((option) => option.value === value)?.label}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {
                  accessOptions.find((option) => option.value === value)
                    ?.description
                }
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => modal.hide()} type="button" variant="outline">
              Отмена
            </Button>
            <Button
              disabled={mutation.isPending}
              onClick={() => void mutation.mutateAsync(value)}
              type="button"
            >
              {mutation.isPending ? <Spinner /> : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);

export default ChangeNotebookAccessModal;
