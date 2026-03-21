import { Trash2 } from "lucide-react";

import type { NotebookSource } from "@/entities/notebook/api/dto/notebook.types";
import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import {
  formatNotebookDate,
  getSourceStatusLabel,
  getSourceStatusTone,
  shouldShowSourceStatusBadge,
} from "@/features/notebook-workspace/lib/notebook-ui";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type NotebookSourceListProps = {
  sources: NotebookSource[];
  isRemoving: boolean;
  onRemove: (sourceId: string) => void;
};

export function NotebookSourceList({
  sources,
  isRemoving,
  onRemove,
}: NotebookSourceListProps) {
  return (
    <>
      <NotebookModuleHeader title="Загруженные источники" />

      <div>
        {sources.length > 0 ? (
          <div className="space-y-3">
            {sources.map((source) => (
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
                      {shouldShowSourceStatusBadge(source.status) ? (
                        <span
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs",
                            getSourceStatusTone(source.status),
                          )}
                        >
                          {getSourceStatusLabel(source.status)}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {source.chunks_count} фрагментов •{" "}
                      {formatNotebookDate(source.created_at)}
                    </p>
                    {source.doc_type ? (
                      <p className="text-sm text-muted-foreground">
                        Тип документа: {source.doc_type}
                      </p>
                    ) : null}
                    {Array.isArray(source.tags) && source.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {source.tags.map((tag) => (
                          <span
                            key={`${source.id}-${tag}`}
                            className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {source.error ? (
                      <p className="text-sm leading-6 text-destructive">
                        {source.error}
                      </p>
                    ) : null}
                  </div>

                  <Button
                    className="w-full lg:w-auto"
                    disabled={isRemoving}
                    onClick={() => onRemove(source.id)}
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
            description="Добавь документы или запись, чтобы блокнот получил рабочий контекст."
          />
        )}
      </div>
    </>
  );
}
