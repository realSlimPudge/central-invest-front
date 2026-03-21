import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Blocks } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import type {
  NotebookQuestions,
  NotebookQuestionItem,
} from "@/entities/notebook/api/dto/notebook.types";
import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import { getNotebookErrorMessage } from "@/features/notebook-workspace/lib/notebook-ui";
import { getNotebookModuleAvailability } from "@/features/notebook-workspace/model/notebook-module-availability";
import { questionContextOptions } from "@/features/notebook-workspace/model/notebook-workspace";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import { NotebookModuleUnavailable } from "@/features/notebook-workspace/ui/NotebookModuleUnavailable";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

function asQuestions(
  value: NotebookQuestions | Record<string, unknown> | null | undefined,
) {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as NotebookQuestions;
}

function getPriorityTone(priority?: string) {
  switch (priority) {
    case "high":
      return "border-destructive/20 bg-destructive/10 text-destructive";
    case "medium":
      return "border-primary/20 bg-primary/10 text-foreground";
    default:
      return "border-border bg-muted/40 text-foreground";
  }
}

export function NotebookQuestionsPage() {
  const queryClient = useQueryClient();
  const { notebookId, notebook } = useNotebookRoute();
  const moduleAvailability = getNotebookModuleAvailability(
    notebook,
    "questions",
  );
  const [contextValue, setContextValue] = useState("general");
  const questions = asQuestions(notebook?.questions);
  const items = Array.isArray(questions?.questions)
    ? (questions?.questions as NotebookQuestionItem[])
    : [];

  const questionsMutation = useMutation({
    mutationKey: notebookKeys.questions(),
    mutationFn: () =>
      notebookApi.questions(notebookId, { context: contextValue }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notebookKeys.detail(notebookId),
      });
      toast.success("Список вопросов обновлен");
    },
    onError: (error) => {
      toast.error(getNotebookErrorMessage(error, "Не удалось собрать вопросы"));
    },
  });

  if (!moduleAvailability.enabled) {
    return (
      <NotebookModuleUnavailable
        notebookId={notebookId}
        reason={moduleAvailability.reason ?? "Модуль временно недоступен."}
        title="Вопросы к документу"
      />
    );
  }

  return (
    <div className="space-y-6">
      <NotebookModuleHeader
        actions={
          <>
            <Select onValueChange={setContextValue} value={contextValue}>
              <SelectTrigger className="h-11 w-full sm:w-56">
                <SelectValue placeholder="Выбери контекст" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {questionContextOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              disabled={questionsMutation.isPending}
              onClick={() => void questionsMutation.mutateAsync()}
              type="button"
            >
              <Blocks className="size-4" />
              {items.length > 0 ? "Обновить вопросы" : "Собрать вопросы"}
            </Button>
          </>
        }
        description="Анализ пробелов, рисков и зон, где документ не дает достаточного ответа."
        title="Вопросы к документу"
      />

      {items.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="ring-1 ring-border/80">
            <CardHeader>
              <CardTitle className="text-xl text-[var(--text-h)]">
                Список вопросов
              </CardTitle>
              <CardDescription>
                Что стоит запросить или уточнить дополнительно.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={`${item.question}-${index}`}
                  className="rounded-3xl border border-border bg-card px-5 py-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs",
                        getPriorityTone(item.priority),
                      )}
                    >
                      {item.priority || "low"}
                    </span>
                    {item.category && (
                      <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-base leading-7 text-foreground">
                    {item.question}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="ring-1 ring-border/80">
            <CardHeader>
              <CardTitle className="text-xl text-[var(--text-h)]">
                Вывод
              </CardTitle>
              <CardDescription>
                Краткая рамка по найденным пробелам и зонам риска.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-foreground">
                {questions?.summary || "Краткий вывод пока не сформирован."}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : notebook?.questions ? (
        <Card className="ring-1 ring-border/80">
          <CardContent className="p-6">
            <pre className="overflow-x-auto text-sm leading-6 text-muted-foreground">
              {JSON.stringify(notebook.questions, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <ArtifactPlaceholder
          title="Вопросы пока не собраны"
          description="Запусти анализ, чтобы увидеть, чего не хватает в документах и какие места требуют дополнительной проверки."
        />
      )}
    </div>
  );
}
