import NiceModal from "@ebay/nice-modal-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Presentation } from "lucide-react";
import { useState } from "react";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import type {
  NotebookPresentation,
  NotebookPresentationBody,
  NotebookPresentationSlide,
} from "@/entities/notebook/api/dto/notebook.types";
import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import GeneratePresentationModal, {
  type PresentationGenerationValues,
} from "@/features/notebook-presentation/ui/GeneratePresentationModal";
import { NotebookPresentationPreview } from "@/features/notebook-presentation/ui/NotebookPresentationPreview";
import { runNotebookRequestWithToast } from "@/features/notebook-workspace/lib/notebook-ui";
import { getNotebookModuleAvailability } from "@/features/notebook-workspace/model/notebook-module-availability";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import { NotebookModuleUnavailable } from "@/features/notebook-workspace/ui/NotebookModuleUnavailable";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

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
  const [settings, setSettings] = useState<PresentationGenerationValues>({
    title: "",
    style: "business",
    prompt: "",
  });
  const presentation = asPresentation(notebook?.presentation);
  const slides = Array.isArray(presentation?.slides)
    ? (presentation.slides as NotebookPresentationSlide[])
    : [];

  const toPresentationBody = (
    nextSettings: PresentationGenerationValues,
  ): NotebookPresentationBody => ({
    title: nextSettings.title,
    style: nextSettings.style,
    prompt: nextSettings.prompt,
  });

  const previewMutation = useMutation({
    mutationKey: notebookKeys.presentation(),
    mutationFn: (body: NotebookPresentationBody) =>
      notebookApi.presentationPreview(notebookId, body),
  });

  const downloadMutation = useMutation({
    mutationKey: [...notebookKeys.presentation(), "download"],
    mutationFn: (body: NotebookPresentationBody) =>
      notebookApi.presentationDownload(notebookId, body),
  });

  const handlePreviewGenerate = async (
    nextSettings: PresentationGenerationValues,
  ) => {
    setSettings(nextSettings);

    return runNotebookRequestWithToast({
      request: previewMutation
        .mutateAsync(toPresentationBody(nextSettings))
        .then(async (result) => {
          await queryClient.invalidateQueries({
            queryKey: notebookKeys.detail(notebookId),
          });
          return result;
        }),
      loading: "Собираем превью презентации...",
      success: "Превью презентации обновлено",
      error: "Не удалось собрать превью презентации",
    });
  };

  const handleDownload = async (
    nextSettings: PresentationGenerationValues = settings,
  ) => {
    setSettings(nextSettings);

    return runNotebookRequestWithToast({
      request: downloadMutation
        .mutateAsync(toPresentationBody(nextSettings))
        .then((blob) => {
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
  };

  const openGenerationModal = (mode: "preview" | "download" = "preview") =>
    NiceModal.show(GeneratePresentationModal, {
      initialValues: settings,
      submitLabel:
        mode === "download"
          ? "Подготовить и скачать"
          : slides.length > 0
            ? "Обновить превью"
            : "Собрать превью",
      onSubmit: async (nextSettings) => {
        if (mode === "download") {
          await handleDownload(nextSettings);
          return;
        }

        await handlePreviewGenerate(nextSettings);
      },
    });

  const hasGeneratedPresentation =
    slides.length > 0 || Boolean(notebook?.presentation);
  const hasPresentationRequest = Boolean(settings.prompt.trim());

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
            <Button
              disabled={previewMutation.isPending}
              onClick={() => void openGenerationModal()}
              type="button"
            >
              <Presentation className="size-4" />
              {slides.length > 0 ? "Обновить превью" : "Собрать превью"}
            </Button>
            <Button
              disabled={downloadMutation.isPending || !hasGeneratedPresentation}
              onClick={() => {
                if (hasPresentationRequest) {
                  void handleDownload();
                  return;
                }

                void openGenerationModal("download");
              }}
              type="button"
              variant="outline"
            >
              <Download className="size-4" />
              Скачать PPTX
            </Button>
          </>
        }
        description="Сначала задай запрос для структуры слайдов, потом пролистай превью и скачай готовую презентацию."
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
          description="Открой настройки, задай запрос и собери превью, чтобы увидеть структуру будущих слайдов."
        />
      )}
    </div>
  );
}
