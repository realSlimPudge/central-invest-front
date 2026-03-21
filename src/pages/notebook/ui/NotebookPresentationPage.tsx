import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Presentation } from "lucide-react";
import { useState } from "react";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import type {
  NotebookPresentation,
  NotebookPresentationSlide,
} from "@/entities/notebook/api/dto/notebook.types";
import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import { NotebookPresentationPreview } from "@/features/notebook-presentation/ui/NotebookPresentationPreview";
import { runNotebookRequestWithToast } from "@/features/notebook-workspace/lib/notebook-ui";
import { getNotebookModuleAvailability } from "@/features/notebook-workspace/model/notebook-module-availability";
import { presentationStyleOptions } from "@/features/notebook-workspace/model/notebook-workspace";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import { NotebookModuleUnavailable } from "@/features/notebook-workspace/ui/NotebookModuleUnavailable";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
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
  const moduleAvailability = getNotebookModuleAvailability(
    notebook,
    "presentation",
  );
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState("business");
  const presentation = asPresentation(notebook?.presentation);
  const slides = Array.isArray(presentation?.slides)
    ? (presentation.slides as NotebookPresentationSlide[])
    : [];

  const previewMutation = useMutation({
    mutationKey: notebookKeys.presentation(),
    mutationFn: () =>
      notebookApi.presentationPreview(notebookId, { style, title }),
  });

  const downloadMutation = useMutation({
    mutationKey: [...notebookKeys.presentation(), "download"],
    mutationFn: () =>
      notebookApi.presentationDownload(notebookId, { style, title }),
  });

  const handlePreviewGenerate = async () =>
    runNotebookRequestWithToast({
      request: previewMutation.mutateAsync().then(async (result) => {
        await queryClient.invalidateQueries({
          queryKey: notebookKeys.detail(notebookId),
        });
        return result;
      }),
      loading: "Собираем превью презентации...",
      success: "Превью презентации обновлено",
      error: "Не удалось собрать превью презентации",
    });

  const handleDownload = async () =>
    runNotebookRequestWithToast({
      request: downloadMutation.mutateAsync().then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "presentation.pptx";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        return blob;
      }),
      loading: "Готовим презентацию к скачиванию...",
      success: "Презентация скачана",
      error: "Не удалось скачать презентацию",
    });

  if (!moduleAvailability.enabled) {
    return (
      <NotebookModuleUnavailable
        notebookId={notebookId}
        reason={moduleAvailability.reason ?? "Модуль временно недоступен."}
        title="Презентация"
      />
    );
  }

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
              onClick={() => void handlePreviewGenerate()}
              type="button"
            >
              <Presentation className="size-4" />
              {slides.length > 0 ? "Обновить превью" : "Собрать превью"}
            </Button>
            <Button
              disabled={downloadMutation.isPending}
              onClick={() => void handleDownload()}
              type="button"
              variant="outline"
            >
              <Download className="size-4" />
              Скачать PPTX
            </Button>
          </>
        }
        description="Сначала собери структуру слайдов, потом пролистай превью как полноценную презентацию и скачай готовый `.pptx`."
        title="Презентация"
      />

      {slides.length > 0 ? (
        <NotebookPresentationPreview slides={slides} />
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
