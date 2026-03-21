import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AudioLines, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import type { NotebookCompareResult } from "@/entities/notebook/api/dto/notebook.types";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import { NotebookSourceComparePanel } from "@/features/notebook-sources/ui/NotebookSourceComparePanel";
import { NotebookSourceList } from "@/features/notebook-sources/ui/NotebookSourceList";
import { NotebookSourceUploadCard } from "@/features/notebook-sources/ui/NotebookSourceUploadCard";
import {
  getNotebookErrorMessage,
  runNotebookRequestWithToast,
} from "@/features/notebook-workspace/lib/notebook-ui";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import type { FileUploadProps } from "@/shared/components/ui/file-upload";

type UploadMutationVariables = {
  files: File[];
  onProgress: (file: File, progress: number) => void;
  onSuccess: (file: File) => void;
  onError: (file: File, error: Error) => void;
};

type UploadMutationResult = {
  total: number;
  successCount: number;
  failedFiles: File[];
};

function getDocumentUploadSuccessMessage(result: UploadMutationResult) {
  if (result.successCount === result.total) {
    return `Документы загружены: ${result.successCount}`;
  }

  return `Загружено ${result.successCount} из ${result.total} документов`;
}

function getMediaUploadSuccessMessage(result: UploadMutationResult) {
  if (result.successCount === result.total) {
    return `Обработано файлов: ${result.successCount}`;
  }

  return `Обработано ${result.successCount} из ${result.total} медиафайлов`;
}

const documentAccept = [
  ".pdf",
  ".docx",
  ".txt",
  ".csv",
  ".xlsx",
  "application/pdf",
  "text/plain",
  "text/csv",
].join(",");

const mediaAccept = [
  "audio/*",
  "video/*",
  ".mp3",
  ".wav",
  ".ogg",
  ".m4a",
  ".flac",
  ".aac",
  ".opus",
  ".mp4",
  ".avi",
  ".mov",
  ".mkv",
  ".webm",
  ".flv",
].join(",");

export function NotebookSourcesPage() {
  const queryClient = useQueryClient();
  const { notebookId, notebook, notebookQuery } = useNotebookRoute();
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [compareState, setCompareState] = useState<{
    selectionKey: string;
    result: NotebookCompareResult | null;
  }>({
    selectionKey: "",
    result: null,
  });

  const readySourceIds = useMemo(
    () =>
      (notebook?.sources ?? [])
        .filter((source) => !source.status || source.status === "ready")
        .map((source) => source.id),
    [notebook?.sources],
  );
  const activeSelectedSourceIds = useMemo(
    () =>
      selectedSourceIds.filter((sourceId) => readySourceIds.includes(sourceId)),
    [readySourceIds, selectedSourceIds],
  );
  const selectionKey = useMemo(
    () => [...activeSelectedSourceIds].sort().join("|"),
    [activeSelectedSourceIds],
  );
  const compareResult =
    compareState.selectionKey === selectionKey ? compareState.result : null;

  const invalidateNotebook = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: notebookKeys.list() }),
      queryClient.invalidateQueries({
        queryKey: notebookKeys.detail(notebookId),
      }),
    ]);
  };

  const uploadDocumentsMutation = useMutation({
    mutationKey: notebookKeys.upload(),
    mutationFn: async ({
      files,
      onProgress,
      onSuccess,
      onError,
    }: UploadMutationVariables): Promise<UploadMutationResult> => {
      const failedFiles: File[] = [];
      let successCount = 0;

      for (const file of files) {
        try {
          onProgress(file, 15);
          await notebookApi.uploadSource(notebookId, file);
          onProgress(file, 100);
          onSuccess(file);
          successCount += 1;
        } catch (error) {
          const uploadError =
            error instanceof Error
              ? error
              : new Error("Не удалось загрузить файл");
          failedFiles.push(file);
          onError(file, uploadError);
        }
      }

      return { total: files.length, successCount, failedFiles };
    },
    onSuccess: async ({ successCount, failedFiles }) => {
      setDocumentFiles(failedFiles);
      if (successCount > 0) {
        await invalidateNotebook();
      }
    },
  });

  const transcribeMutation = useMutation({
    mutationKey: notebookKeys.transcribe(),
    mutationFn: async ({
      files,
      onProgress,
      onSuccess,
      onError,
    }: UploadMutationVariables): Promise<UploadMutationResult> => {
      const failedFiles: File[] = [];
      let successCount = 0;

      for (const file of files) {
        try {
          onProgress(file, 15);
          await notebookApi.transcribeSource(notebookId, file);
          onProgress(file, 100);
          onSuccess(file);
          successCount += 1;
        } catch (error) {
          const uploadError =
            error instanceof Error
              ? error
              : new Error("Не удалось обработать файл");
          failedFiles.push(file);
          onError(file, uploadError);
        }
      }

      return { total: files.length, successCount, failedFiles };
    },
    onSuccess: async ({ successCount, failedFiles }) => {
      setMediaFiles(failedFiles);
      if (successCount > 0) {
        await invalidateNotebook();
      }
    },
  });

  const removeSourceMutation = useMutation({
    mutationKey: notebookKeys.removeSource(),
    mutationFn: (sourceId: string) =>
      notebookApi.removeSource(notebookId, sourceId),
    onSuccess: async () => {
      await invalidateNotebook();
      toast.success("Источник удален");
    },
    onError: (error) => {
      toast.error(
        getNotebookErrorMessage(error, "Не удалось удалить источник"),
      );
    },
  });

  const compareSourcesMutation = useMutation({
    mutationKey: notebookKeys.compare(),
    mutationFn: () => {
      const [firstSourceId, secondSourceId] = activeSelectedSourceIds;

      if (!firstSourceId || !secondSourceId) {
        throw new Error("Для сравнения нужно выбрать ровно два источника");
      }

      return notebookApi.compareSources(notebookId, {
        source_ids: [firstSourceId, secondSourceId],
      });
    },
  });

  const handleFileReject: NonNullable<FileUploadProps["onFileReject"]> = (
    file,
    message,
  ) => {
    toast.error(`${file.name}: ${message}`);
  };

  const handleSourceSelectionChange = (sourceId: string, checked: boolean) => {
    setSelectedSourceIds((current) => {
      if (checked) {
        if (current.length >= 2 && !current.includes(sourceId)) {
          return current;
        }

        return current.includes(sourceId) ? current : [...current, sourceId];
      }

      return current.filter((id) => id !== sourceId);
    });
  };

  const handleCompareSources = async () => {
    if (activeSelectedSourceIds.length !== 2) {
      return;
    }

    const result = await runNotebookRequestWithToast({
      request: compareSourcesMutation.mutateAsync(),
      loading: "Сравниваем выбранные источники...",
      success: "Сравнение готово",
      error: "Не удалось сравнить выбранные источники",
    });

    setCompareState({
      selectionKey,
      result,
    });
  };

  return (
    <div className="space-y-6">
      <NotebookModuleHeader
        description="Добавляй документы, таблицы, аудио и видео. После загрузки материалы становятся основой для всех режимов работы."
        title="Источники"
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <NotebookSourceUploadCard
          accept={documentAccept}
          description="Загружай PDF, DOCX, TXT, CSV и XLSX. После загрузки документы разбиваются на фрагменты и сразу становятся доступными для поиска и генерации артефактов."
          disabled={
            uploadDocumentsMutation.isPending || notebookQuery.isPending
          }
          dropzoneDescription="Или нажми, чтобы выбрать файлы вручную."
          dropzoneTitle="Перетащи документы сюда"
          files={documentFiles}
          icon={Upload}
          label="Загрузка документов"
          onFileReject={handleFileReject}
          onUpload={async (files, options) => {
            const request = uploadDocumentsMutation
              .mutateAsync({
                files,
                onError: options.onError,
                onProgress: options.onProgress,
                onSuccess: options.onSuccess,
              })
              .then((result) => {
                if (result.successCount === 0) {
                  throw new Error("Не удалось загрузить документы");
                }

                return result;
              });

            toast.promise(request, {
              loading: "Загружаем документы...",
              success: getDocumentUploadSuccessMessage,
              error: (error) =>
                getNotebookErrorMessage(
                  error,
                  "Не удалось загрузить документы",
                ),
            });

            await request;
          }}
          onValueChange={setDocumentFiles}
          title="Документы и таблицы"
        />

        <NotebookSourceUploadCard
          accept={mediaAccept}
          description="Загружай записи и ролики. Система подготовит текстовую версию и добавит ее в блокнот как обычный источник."
          disabled={transcribeMutation.isPending || notebookQuery.isPending}
          dropzoneDescription="MP3, WAV, OGG, MP4, MOV, MKV и другие медиаформаты."
          dropzoneTitle="Перетащи аудио или видео"
          files={mediaFiles}
          icon={AudioLines}
          label="Обработка аудио и видео"
          onFileReject={handleFileReject}
          onUpload={async (files, options) => {
            const request = transcribeMutation
              .mutateAsync({
                files,
                onError: options.onError,
                onProgress: options.onProgress,
                onSuccess: options.onSuccess,
              })
              .then((result) => {
                if (result.successCount === 0) {
                  throw new Error("Не удалось обработать аудио или видео");
                }

                return result;
              });

            toast.promise(request, {
              loading: "Обрабатываем аудио и видео...",
              success: getMediaUploadSuccessMessage,
              error: (error) =>
                getNotebookErrorMessage(
                  error,
                  "Не удалось обработать аудио или видео",
                ),
            });

            await request;
          }}
          onValueChange={setMediaFiles}
          title="Аудио и видео"
        />
      </div>

      <NotebookSourceList
        isRemoving={removeSourceMutation.isPending}
        onRemove={(sourceId) => void removeSourceMutation.mutateAsync(sourceId)}
        onSelectionChange={handleSourceSelectionChange}
        selectedSourceIds={activeSelectedSourceIds}
        sources={notebook?.sources ?? []}
      />

      <NotebookSourceComparePanel
        isPending={compareSourcesMutation.isPending}
        onCompare={() => void handleCompareSources()}
        result={compareResult}
        selectedCount={activeSelectedSourceIds.length}
      />
    </div>
  );
}
