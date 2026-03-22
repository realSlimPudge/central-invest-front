import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useState } from "react";

import { presentationStyleOptions } from "@/features/notebook-workspace/model/notebook-workspace";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Spinner } from "@/shared/components/ui/spinner";
import { Textarea } from "@/shared/components/ui/textarea";

export type PresentationGenerationValues = {
  title: string;
  style: "business" | "academic" | "popular" | string;
  prompt: string;
};

type GeneratePresentationModalProps = {
  initialValues: PresentationGenerationValues;
  onSubmit: (values: PresentationGenerationValues) => Promise<void>;
  submitLabel?: string;
};

const GeneratePresentationModal =
  NiceModal.create<GeneratePresentationModalProps>(
    ({ initialValues, onSubmit, submitLabel = "Собрать превью" }) => {
      const modal = useModal();
      const [title, setTitle] = useState(initialValues.title);
      const [style, setStyle] = useState(initialValues.style);
      const [prompt, setPrompt] = useState(initialValues.prompt);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [isPromptTouched, setIsPromptTouched] = useState(false);

      const promptError = prompt.trim()
        ? null
        : "Введите запрос, по которому нужно собрать презентацию.";

      const handleSubmit = async () => {
        setIsPromptTouched(true);

        if (promptError) {
          return;
        }

        setIsSubmitting(true);

        try {
          const request = onSubmit({
            title: title.trim(),
            style,
            prompt: prompt.trim(),
          });

          modal.hide();
          void request.catch(() => undefined);
        } finally {
          setIsSubmitting(false);
        }
      };

      return (
        <Dialog
          onOpenChange={(open) => {
            if (!open) modal.hide();
          }}
          open={modal.visible}
        >
          <DialogContent
            className="sm:max-w-xl"
            onAnimationEnd={() => {
              if (!modal.visible) modal.remove();
            }}
            showCloseButton
          >
            <DialogHeader>
              <DialogTitle>Настройки презентации</DialogTitle>
              <DialogDescription>
                Укажи тему и тон презентации. Запрос нужен для сборки структуры
                слайдов.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="presentation-title">
                  Название презентации
                </FieldLabel>
                <Input
                  id="presentation-title"
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Например: Ключевые выводы по документам"
                  value={title}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="presentation-style">Стиль</FieldLabel>
                <Select onValueChange={setStyle} value={style}>
                  <SelectTrigger id="presentation-style" className="w-full">
                    <SelectValue placeholder="Выбери стиль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {presentationStyleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field data-invalid={Boolean(isPromptTouched && promptError)}>
                <FieldLabel htmlFor="presentation-prompt">
                  Запрос для генерации
                </FieldLabel>
                <Textarea
                  aria-invalid={Boolean(isPromptTouched && promptError)}
                  id="presentation-prompt"
                  onBlur={() => setIsPromptTouched(true)}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Например: собери презентацию для руководителя с акцентом на выводы, риски и ключевые решения."
                  value={prompt}
                />
                {isPromptTouched && promptError ? (
                  <FieldError>{promptError}</FieldError>
                ) : null}
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button
                disabled={isSubmitting}
                onClick={() => modal.hide()}
                type="button"
                variant="outline"
              >
                Отмена
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={() => void handleSubmit()}
                type="button"
              >
                {isSubmitting ? <Spinner /> : submitLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    },
  );

export default GeneratePresentationModal;
