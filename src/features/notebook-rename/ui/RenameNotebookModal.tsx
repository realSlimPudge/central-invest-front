import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";

import { renameNotebookScheme } from "../config/rename-notebook.scheme";

type RenameNotebookModalProps = {
  notebookId: string;
  title: string;
};

const RenameNotebookModal = NiceModal.create<RenameNotebookModalProps>(
  ({ notebookId, title }) => {
    const modal = useModal();
    const queryClient = useQueryClient();

    const mutation = useMutation({
      mutationKey: [...notebookKeys.detail(notebookId), "rename"],
      mutationFn: (nextTitle: string) =>
        notebookApi.update(notebookId, { title: nextTitle }),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: notebookKeys.list() }),
          queryClient.invalidateQueries({ queryKey: notebookKeys.detail(notebookId) }),
        ]);
        toast.success("Название блокнота обновлено");
        modal.hide();
      },
      onError: (error) => {
        toast.error(
          getNotebookErrorMessage(error, "Не удалось обновить название блокнота"),
        );
      },
    });

    const form = useForm({
      defaultValues: {
        title,
      },
      validators: {
        onChange: renameNotebookScheme,
      },
      onSubmit: async ({ value }) => {
        await mutation.mutateAsync(value.title.trim());
      },
    });

    return (
      <Dialog
        onOpenChange={(open) => {
          if (!open) modal.hide();
        }}
        open={modal.visible}
      >
        <form
          id="rename-notebook-form"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogContent
            onAnimationEnd={() => {
              if (!modal.visible) modal.remove();
            }}
            showCloseButton
          >
            <DialogHeader>
              <DialogTitle>Переименовать блокнот</DialogTitle>
              <DialogDescription>
                Обнови название, под которым блокнот будет виден в навигации и в
                заголовке.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <form.Field
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Название</FieldLabel>
                      <Input
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="Введите новое название"
                        value={field.state.value}
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
                name="title"
              />
            </FieldGroup>

            <DialogFooter>
              <Button
                onClick={() => modal.hide()}
                type="button"
                variant="outline"
              >
                Отмена
              </Button>
              <Button disabled={mutation.isPending} form="rename-notebook-form" type="submit">
                {mutation.isPending ? <Spinner /> : "Сохранить"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    );
  },
);

export default RenameNotebookModal;
