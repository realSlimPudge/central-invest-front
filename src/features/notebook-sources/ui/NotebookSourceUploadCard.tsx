import type { LucideIcon } from "lucide-react";

import { X } from "lucide-react";

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
  type FileUploadProps,
} from "@/shared/components/ui/file-upload";

type NotebookSourceUploadCardProps = {
  title: string;
  description: string;
  label: string;
  accept: string;
  files: File[];
  disabled: boolean;
  icon: LucideIcon;
  dropzoneTitle: string;
  dropzoneDescription: string;
  onValueChange: (files: File[]) => void;
  onFileReject: NonNullable<FileUploadProps["onFileReject"]>;
  onUpload: NonNullable<FileUploadProps["onUpload"]>;
};

export function NotebookSourceUploadCard({
  title,
  description,
  label,
  accept,
  files,
  disabled,
  icon: Icon,
  dropzoneTitle,
  dropzoneDescription,
  onValueChange,
  onFileReject,
  onUpload,
}: NotebookSourceUploadCardProps) {
  return (
    <Card className="ring-1 ring-border/80">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </CardTitle>
        <CardDescription className="text-sm leading-6 text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          accept={accept}
          className="w-full"
          disabled={disabled}
          label={label}
          multiple
          onFileReject={onFileReject}
          onUpload={onUpload}
          value={files}
          onValueChange={onValueChange}
        >
          <FileUploadDropzone className="rounded-3xl border-dashed bg-muted/35 px-6 py-10 text-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <Icon className="size-8 text-primary" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-[var(--text-h)]">
                  {dropzoneTitle}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {dropzoneDescription}
                </p>
              </div>
            </div>
          </FileUploadDropzone>
          <FileUploadList>
            {files.map((file) => (
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
                  <Button
                    className="size-8 rounded-full"
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <X className="size-4 text-muted-foreground" />
                  </Button>
                </FileUploadItemDelete>
              </FileUploadItem>
            ))}
          </FileUploadList>
        </FileUpload>
      </CardContent>
    </Card>
  );
}
