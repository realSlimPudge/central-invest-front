import ReactMarkdown from "react-markdown";

import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Spinner } from "@/shared/components/ui/spinner";
import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import {
  SUMMARY_STYLE_OPTIONS,
  type SummaryStyle,
} from "@/features/notebook-artifacts/model/notebook-artifacts";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import { summaryMarkdownComponents } from "../config/markdonw";

type NotebookSummaryTabProps = {
  summary: string | null | undefined;
  summaryStyle: SummaryStyle;
  onSummaryStyleChange: (value: SummaryStyle) => void;
  onGenerate: () => void;
  isPending: boolean;
};

export function NotebookSummaryTab({
  summary,
  summaryStyle,
  onSummaryStyleChange,
  onGenerate,
  isPending,
}: NotebookSummaryTabProps) {
  return (
    <div className="space-y-5">
      <NotebookModuleHeader
        actions={
          <>
            <Select
              onValueChange={(value) =>
                onSummaryStyleChange(value as SummaryStyle)
              }
              value={summaryStyle}
            >
              <SelectTrigger className="h-11 w-full sm:w-44">
                <SelectValue placeholder="Выбери стиль" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SUMMARY_STYLE_OPTIONS.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button disabled={isPending} onClick={onGenerate} type="button">
              {isPending ? <Spinner /> : "Обновить саммари"}
            </Button>
          </>
        }
        description="Краткая выжимка по текущим источникам. Можно переделать в другом стиле."
        title="Саммари блокнота"
      />

      {summary ? (
        <div className="rounded-3xl border border-border bg-card px-6 py-5">
          <div className="space-y-4 overflow-auto max-h-105">
            <ReactMarkdown components={summaryMarkdownComponents}>
              {summary}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <ArtifactPlaceholder
          title="Саммари пока нет"
          description="Сгенерируй первый summary, и он будет храниться прямо в ответе блокнота."
        />
      )}
    </div>
  );
}
