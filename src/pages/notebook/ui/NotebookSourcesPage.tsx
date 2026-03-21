import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AudioLines, Trash2, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import {
  formatNotebookDate,
  getNotebookErrorMessage,
  getSourceStatusLabel,
  getSourceStatusTone,
} from "@/features/notebook-workspace/lib/notebook-ui";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
} from "@/shared/components/ui/file-upload";
import { cn } from "@/shared/lib/utils";

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
      queryClient.invalidateQueries({ queryKey: notebookKeys.detail(notebookId) }),
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
            error instanceof Error ? error : new Error("Не удалось загрузить файл");
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
      toast.error(getNotebookErrorMessage(error, "Не удалось загрузить документы"));
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
            error instanceof Error ? error : new Error("Не удалось транскрибировать файл");
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
        toast.success(`Транскрибировано файлов: ${successCount}`);
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
    mutationFn: (sourceId: string) => notebookApi.removeSource(notebookId, sourceId),
    onSuccess: async () => {
      await invalidateNotebook();
      toast.success("Источник удален");
    },
    onError: (error) => {
      toast.error(getNotebookErrorMessage(error, "Не удалось удалить источник"));
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="ring-1 ring-border/80">
          <CardHeader>
            <CardTitle className="text-2xl text-[var(--text-h)]">
              Документы и таблицы
            </CardTitle>
            <CardDescription className="text-base leading-7">
              Загружай PDF, DOCX, TXT, CSV и XLSX. После загрузки документы
              разбиваются на чанки и сразу становятся доступными для поиска и
              генерации артефактов.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              accept={documentAccept}
              className="w-full"
              disabled={uploadDocumentsMutation.isPending || notebookQuery.isPending}
              label="Загрузка документов"
              multiple
              onFileReject={(file, message) => {
                toast.error(`${file.name}: ${message}`);
              }}
              onUpload={async (files, options) => {
                await uploadDocumentsMutation.mutateAsync({
                  files,
                  onError: options.onError,
                  onProgress: options.onProgress,
                  onSuccess: options.onSuccess,
                });
              }}
              value={documentFiles}
              onValueChange={setDocumentFiles}
            >
              <FileUploadDropzone className="rounded-3xl border-dashed bg-muted/35 px-6 py-10 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Upload className="size-8 text-primary" />
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-[var(--text-h)]">
                      Перетащи документы сюда
                    </p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Или нажми, чтобы выбрать файлы вручную.
                    </p>
                  </div>
                </div>
              </FileUploadDropzone>
              <FileUploadList>
                {documentFiles.map((file) => (
                  <FileUploadItem
                    key={`${file.name}-${file.lastModified}-${file.size}`}
                    value={file}
                    className="rounded-2xl border-border bg-card"
                  >
                    <FileUploadItemPreview className="rounded-xl border-border bg-muted/50" />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <FileUploadItemMetadata />
                      <FileUploadItemProgress />
                    </div>
                    <FileUploadItemDelete asChild>
                      <Button className="size-8 rounded-full" size="icon" type="button" variant="ghost">
                        <X className="size-4 text-muted-foreground" />
                      </Button>
                    </FileUploadItemDelete>
                  </FileUploadItem>
                ))}
              </FileUploadList>
            </FileUpload>
          </CardContent>
        </Card>

        <Card className="ring-1 ring-border/80">
          <CardHeader>
            <CardTitle className="text-2xl text-[var(--text-h)]">
              Аудио и видео
            </CardTitle>
            <CardDescription className="text-base leading-7">
              Загружай записи и ролики. Бэк прогонит их через Whisper и сохранит
              транскрипцию как обычный источник внутри блокнота.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              accept={mediaAccept}
              className="w-full"
              disabled={transcribeMutation.isPending || notebookQuery.isPending}
              label="Транскрибация аудио и видео"
              multiple
              onFileReject={(file, message) => {
                toast.error(`${file.name}: ${message}`);
              }}
              onUpload={async (files, options) => {
                await transcribeMutation.mutateAsync({
                  files,
                  onError: options.onError,
                  onProgress: options.onProgress,
                  onSuccess: options.onSuccess,
                });
              }}
              value={mediaFiles}
              onValueChange={setMediaFiles}
            >
              <FileUploadDropzone className="rounded-3xl border-dashed bg-muted/35 px-6 py-10 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <AudioLines className="size-8 text-primary" />
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-[var(--text-h)]">
                      Перетащи аудио или видео
                    </p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      MP3, WAV, OGG, MP4, MOV, MKV и другие медиаформаты.
                    </p>
                  </div>
                </div>
              </FileUploadDropzone>
              <FileUploadList>
                {mediaFiles.map((file) => (
                  <FileUploadItem
                    key={`${file.name}-${file.lastModified}-${file.size}`}
                    value={file}
                    className="rounded-2xl border-border bg-card"
                  >
                    <FileUploadItemPreview className="rounded-xl border-border bg-muted/50" />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <FileUploadItemMetadata />
                      <FileUploadItemProgress />
                    </div>
                    <FileUploadItemDelete asChild>
                      <Button className="size-8 rounded-full" size="icon" type="button" variant="ghost">
                        <X className="size-4 text-muted-foreground" />
                      </Button>
                    </FileUploadItemDelete>
                  </FileUploadItem>
                ))}
              </FileUploadList>
            </FileUpload>
          </CardContent>
        </Card>
      </div>

      <Card className="ring-1 ring-border/80">
        <CardHeader>
          <CardTitle className="text-2xl text-[var(--text-h)]">
            Источники блокнота
          </CardTitle>
          <CardDescription>
            Все документы, транскрипции и текущий статус их обработки.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notebook && notebook.sources.length > 0 ? (
            <div className="space-y-3">
              {notebook.sources.map((source) => (
                <div
                  key={source.id}
                  className="rounded-3xl border border-border bg-card px-5 py-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-lg font-semibold text-[var(--text-h)]">
                          {source.filename}
                        </p>
                        <span
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs",
                            getSourceStatusTone(source.status),
                          )}
                        >
                          {getSourceStatusLabel(source.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {source.chunks_count} чанков • {formatNotebookDate(source.created_at)}
                      </p>
                      {source.error && (
                        <p className="text-sm leading-6 text-destructive">
                          {source.error}
                        </p>
                      )}
                    </div>

                    <Button
                      className="w-full lg:w-auto"
                      disabled={removeSourceMutation.isPending}
                      onClick={() => void removeSourceMutation.mutateAsync(source.id)}
                      type="button"
                      variant="outline"
                    >
                      <Trash2 className="size-4" />
                      Удалить источник
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ArtifactPlaceholder
              title="Источников пока нет"
              description="Добавь документы или загрузи запись на транскрибацию, чтобы блокнот получил рабочий контекст."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
