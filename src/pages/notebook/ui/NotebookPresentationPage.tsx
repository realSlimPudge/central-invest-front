import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Presentation } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import type {
  NotebookPresentation,
  NotebookPresentationSlide,
} from "@/entities/notebook/api/dto/notebook.types";
import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import { getNotebookErrorMessage } from "@/features/notebook-workspace/lib/notebook-ui";
import { presentationStyleOptions } from "@/features/notebook-workspace/model/notebook-workspace";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

function asPresentation(
  value: NotebookPresentation | Record<string, unknown> | null | undefined,
) {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as NotebookPresentation;
}

export function NotebookPresentationPage() {
  const queryClient = useQueryClient();
  const { notebookId, notebook } = useNotebookRoute();
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState("business");
  const presentation = asPresentation(notebook?.presentation);
  const slides = Array.isArray(presentation?.slides)
    ? (presentation?.slides as NotebookPresentationSlide[])
    : [];

  const previewMutation = useMutation({
    mutationKey: notebookKeys.presentation(),
    mutationFn: () =>
      notebookApi.presentationPreview(notebookId, { style, title }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notebookKeys.detail(notebookId),
      });
      toast.success("Превью презентации обновлено");
    },
    onError: (error) => {
      toast.error(
        getNotebookErrorMessage(error, "Не удалось собрать превью презентации"),
      );
    },
  });

  const downloadMutation = useMutation({
    mutationKey: [...notebookKeys.presentation(), "download"],
    mutationFn: () =>
      notebookApi.presentationDownload(notebookId, { style, title }),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "presentation.pptx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Презентация скачана");
    },
    onError: (error) => {
      toast.error(
        getNotebookErrorMessage(error, "Не удалось скачать презентацию"),
      );
    },
  });

  return (
    <div className="space-y-6">
      <NotebookModuleHeader
        actions={
          <>
            <Input
              className="sm:w-56"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Заголовок презентации"
              value={title}
            />
            <Select onValueChange={setStyle} value={style}>
              <SelectTrigger className="h-11 w-full sm:w-48">
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
            <Button
              disabled={previewMutation.isPending}
              onClick={() => void previewMutation.mutateAsync()}
              type="button"
            >
              <Presentation className="size-4" />
              {slides.length > 0 ? "Обновить превью" : "Собрать превью"}
            </Button>
            <Button
              disabled={downloadMutation.isPending}
              onClick={() => void downloadMutation.mutateAsync()}
              type="button"
              variant="outline"
            >
              <Download className="size-4" />
              Скачать PPTX
            </Button>
          </>
        }
        description="Сначала собери структуру слайдов, потом скачай готовый `.pptx`."
        title="Презентация"
      />

      {slides.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {slides.map((slide, index) => (
            <Card
              key={`${slide.title}-${index}`}
              className="ring-1 ring-border/80"
            >
              <CardHeader>
                <CardDescription>Слайд {index + 1}</CardDescription>
                <CardTitle className="text-xl text-[var(--text-h)]">
                  {slide.title || "Без названия"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {slide.subtitle && (
                  <p className="text-sm text-muted-foreground">
                    {slide.subtitle}
                  </p>
                )}
                {Array.isArray(slide.bullets) && slide.bullets.length > 0 ? (
                  <div className="space-y-2">
                    {slide.bullets.map((bullet, bulletIndex) => (
                      <div
                        key={`${index}-${bulletIndex}`}
                        className="rounded-2xl bg-muted/35 px-3 py-3 text-sm leading-6 text-foreground"
                      >
                        {bullet}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Тип слайда: {slide.type || "content"}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notebook?.presentation ? (
        <Card className="ring-1 ring-border/80">
          <CardContent className="p-6">
            <pre className="overflow-x-auto text-sm leading-6 text-muted-foreground">
              {JSON.stringify(notebook.presentation, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <ArtifactPlaceholder
          title="Презентация пока не собрана"
          description="Собери превью, чтобы увидеть структуру будущих слайдов, а затем скачай готовый PPTX."
        />
      )}
    </div>
  );
}
