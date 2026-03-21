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
import { Checkbox, CheckboxIndicator } from "@/shared/components/ui/checkbox";
import { cn } from "@/shared/lib/utils";

type NotebookSourceListProps = {
  sources: NotebookSource[];
  isRemoving: boolean;
  onRemove: (sourceId: string) => void;
  selectedSourceIds: string[];
  onSelectionChange: (sourceId: string, checked: boolean) => void;
};

export function NotebookSourceList({
  sources,
  isRemoving,
  onRemove,
  selectedSourceIds,
  onSelectionChange,
}: NotebookSourceListProps) {
  const hasReachedCompareLimit = selectedSourceIds.length >= 2;

  return (
    <>
      <NotebookModuleHeader
        actions={
          selectedSourceIds.length > 0 ? (
            <span className="text-sm text-muted-foreground">
              Выбрано: {selectedSourceIds.length} из 2
            </span>
          ) : null
        }
        title="Загруженные источники"
      />

      <div>
        {sources.length > 0 ? (
          <div className="space-y-3">
            {sources.map((source) => (
              <div
                key={source.id}
                className="rounded-3xl border border-border bg-card px-5 py-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <Checkbox
                      aria-label={`Выбрать источник ${source.filename}`}
                      checked={selectedSourceIds.includes(source.id)}
                      className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={
                        source.status === "processing" ||
                        source.status === "error" ||
                        (hasReachedCompareLimit &&
                          !selectedSourceIds.includes(source.id))
                      }
                      onCheckedChange={(checked) =>
                        onSelectionChange(source.id, checked === true)
                      }
                    >
                      <CheckboxIndicator className="size-3.5" />
                    </Checkbox>

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
