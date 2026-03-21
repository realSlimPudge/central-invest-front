import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
  Dialog,
  DialogContent,
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { Spinner } from "@/shared/components/ui/spinner";
import { notebookOptions } from "@/entities/notebook/api/notebook.options";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import { Button } from "@/shared/components/ui/button";
import type { CreateNotebookBody } from "@/entities/notebook/api/dto/notebook.types";
import { createNotebookScheme } from "../config/create-scheme";
import { Input } from "@/shared/components/ui/input";
import { useNavigate } from "@tanstack/react-router";

const CreateNotebookModal = NiceModal.create(() => {
  const queryClient = useQueryClient();
  const modal = useModal();
  const navigate = useNavigate();

  const mutation = useMutation({
    ...notebookOptions.create(),
    onSuccess: async (notebook) => {
      await queryClient.invalidateQueries({ queryKey: notebookKeys.list() });
      await navigate({ to: "/notebooks/$id", params: { id: notebook.id } });
    },
  });

  const form = useForm({
    defaultValues: {
      title: "",
    },
    validators: {
      onChange: createNotebookScheme,
    },
    onSubmit: async ({ value }) => {
      const body: CreateNotebookBody = { title: value.title };
      await mutation.mutateAsync(body);
      modal.hide();
    },
  });

  return (
    <Dialog open={modal.visible}>
      <form
        id="create-notebook"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <DialogContent
          showCloseButton={true}
          onAnimationEnd={() => {
            if (!modal.visible) modal.remove();
          }}
        >
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <form.Field
              name="title"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field>
                    <FieldLabel className="text-base">
                      Название блокнота
                    </FieldLabel>

                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Введите название блокнота"
                      autoComplete="off"
                    />

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
          <DialogFooter className="items-center">
            <Button
              className="cursor-pointer"
              variant={mutation.isError ? "destructive" : "default"}
              type="submit"
              form="create-notebook"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? <Spinner /> : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
});

export default CreateNotebookModal;
