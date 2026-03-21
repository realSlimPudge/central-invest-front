import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AudioLines, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import { NotebookSourceList } from "@/features/notebook-sources/ui/NotebookSourceList";
import { NotebookSourceUploadCard } from "@/features/notebook-sources/ui/NotebookSourceUploadCard";
import { getNotebookErrorMessage } from "@/features/notebook-workspace/lib/notebook-ui";
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
    onSuccess: async ({ total, successCount, failedFiles }) => {
      setDocumentFiles(failedFiles);
      if (successCount > 0) {
        await invalidateNotebook();
      }

      if (successCount === total) {
        toast.success(`Документы загружены: ${successCount}`);
        return;
      }

      if (successCount === 0) {
        toast.error("Не удалось загрузить документы");
        return;
      }

      toast.error(`Загружено ${successCount} из ${total} документов`);
    },
    onError: (error) => {
      toast.error(
        getNotebookErrorMessage(error, "Не удалось загрузить документы"),
      );
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
    onSuccess: async ({ total, successCount, failedFiles }) => {
      setMediaFiles(failedFiles);
      if (successCount > 0) {
        await invalidateNotebook();
      }

      if (successCount === total) {
        toast.success(`Обработано файлов: ${successCount}`);
        return;
      }

      if (successCount === 0) {
        toast.error("Не удалось обработать аудио или видео");
        return;
      }

      toast.error(`Обработано ${successCount} из ${total} медиафайлов`);
    },
    onError: (error) => {
      toast.error(
        getNotebookErrorMessage(error, "Не удалось обработать аудио или видео"),
      );
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

  const handleFileReject: NonNullable<FileUploadProps["onFileReject"]> = (
    file,
    message,
  ) => {
    toast.error(`${file.name}: ${message}`);
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
            await uploadDocumentsMutation.mutateAsync({
              files,
              onError: options.onError,
              onProgress: options.onProgress,
              onSuccess: options.onSuccess,
            });
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
            await transcribeMutation.mutateAsync({
              files,
              onError: options.onError,
              onProgress: options.onProgress,
              onSuccess: options.onSuccess,
            });
          }}
          onValueChange={setMediaFiles}
          title="Аудио и видео"
        />
      </div>

      <NotebookSourceList
        isRemoving={removeSourceMutation.isPending}
        onRemove={(sourceId) => void removeSourceMutation.mutateAsync(sourceId)}
        sources={notebook?.sources ?? []}
      />
    </div>
  );
}
