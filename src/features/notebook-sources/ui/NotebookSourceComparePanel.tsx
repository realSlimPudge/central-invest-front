import type { NotebookCompareResult } from "@/entities/notebook/api/dto/notebook.types";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import { GitCompareArrows } from "lucide-react";
import { cn } from "@/shared/lib/utils";

function getRiskTone(value?: string) {
  switch (value) {
    case "high":
      return "border-destructive/20 bg-destructive/10 text-destructive";
    case "medium":
      return "border-primary/20 bg-primary/10 text-foreground";
    default:
      return "border-border bg-muted/40 text-foreground";
  }
}

function hasStructuredResult(result: NotebookCompareResult | null) {
  if (!result) {
    return false;
  }

  return Boolean(
    result.summary ||
    result.risk_level ||
    (Array.isArray(result.changes) && result.changes.length > 0),
  );
}

type NotebookSourceComparePanelProps = {
  result: NotebookCompareResult | null;
  isPending: boolean;
  selectedCount: number;
  onCompare: () => void;
};

export function NotebookSourceComparePanel({
  result,
  isPending,
  selectedCount,
  onCompare,
}: NotebookSourceComparePanelProps) {
  const labels = (
    Array.isArray(result?.labels)
      ? result.labels
      : [result?.label_a, result?.label_b, ...(result?.compared_sources ?? [])]
  ).filter(Boolean);

  return (
    <div className="space-y-6">
      <NotebookModuleHeader
        actions={
          <Button
            disabled={selectedCount !== 2 || isPending}
            onClick={onCompare}
            type="button"
          >
            <GitCompareArrows className="size-4" />
            Сравнить источники
          </Button>
        }
        description="Выбери ровно два источника и сравни, где они совпадают, расходятся или создают риски."
        title="Сравнение источников"
      />

      {hasStructuredResult(result) ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="ring-1 ring-border/80">
            <CardContent className="space-y-6 p-6">
              {result?.summary ? (
                <div className="rounded-3xl border border-border bg-card px-5 py-5">
                  <p className="text-lg font-semibold text-[var(--text-h)]">
                    Краткий вывод
                  </p>
                  <p className="mt-4 text-sm leading-7 text-foreground">
                    {result.summary}
                  </p>
                </div>
              ) : null}

              {Array.isArray(result?.changes) && result.changes.length > 0 ? (
                <div className="space-y-3">
                  {result.changes.map((change, index) => (
                    <div
                      key={`${change.section ?? "section"}-${index}`}
                      className="rounded-3xl border border-border bg-card px-5 py-5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        {change.section ? (
                          <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                            {change.section}
                          </span>
                        ) : null}
                        {change.type ? (
                          <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                            {change.type}
                          </span>
                        ) : null}
                        {change.severity ? (
                          <span
                            className={cn(
                              "rounded-full border px-3 py-1 text-xs",
                              getRiskTone(change.severity),
                            )}
                          >
                            {change.severity}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-4 text-sm leading-7 text-foreground">
                        {change.description || "Описание не указано."}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="ring-1 ring-border/80">
            <CardContent className="space-y-4 p-6">
              {labels.length > 0 ? (
                <div className="rounded-2xl border border-border bg-card px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Участвуют в сравнении
                  </p>
                  <div className="mt-3 space-y-2">
                    {labels.map((label) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-border bg-muted/30 px-3 py-3 text-sm text-foreground"
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {result?.risk_level ? (
                <div className="rounded-2xl border border-border bg-card px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Уровень риска
                  </p>
                  <span
                    className={cn(
                      "mt-3 inline-flex rounded-full border px-3 py-1 text-sm",
                      getRiskTone(result.risk_level),
                    )}
                  >
                    {result.risk_level}
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : result ? (
        <Card className="ring-1 ring-border/80">
          <CardContent className="p-6">
            <pre className="overflow-x-auto text-sm leading-6 text-muted-foreground">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <Card className="ring-1 ring-border/80">
          <CardContent className="p-6">
            <Empty className="border border-dashed border-border bg-muted/20 py-12">
              <EmptyHeader>
                <EmptyTitle>Сравнение пока не запущено</EmptyTitle>
                <EmptyDescription>
                  {selectedCount === 2
                    ? "Нажми на кнопку сравнения, чтобы получить вывод по выбранным источникам."
                    : "Отметь ровно два готовых источника в списке выше, чтобы сравнить их между собой."}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  disabled={selectedCount !== 2 || isPending}
                  onClick={onCompare}
                  type="button"
                  variant="outline"
                >
                  <GitCompareArrows className="size-4" />
                  Сравнить выбранные
                </Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
