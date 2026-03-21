import { useEffect, useMemo, useState } from "react";

import type {
  NotebookFlashcard,
  NotebookFlashcardsCheckResult,
} from "@/entities/notebook/api/dto/notebook.types";
import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Spinner } from "@/shared/components/ui/spinner";
import { Textarea } from "@/shared/components/ui/textarea";

type NotebookFlashcardsTabProps = {
  flashcards: NotebookFlashcard[] | null | undefined;
  flashcardsCount: number;
  onFlashcardsCountChange: (value: number) => void;
  onGenerate: () => void;
  onCheck: (payload: {
    question: string;
    correctAnswer: string;
    userAnswer: string;
  }) => Promise<NotebookFlashcardsCheckResult>;
  isGenerating: boolean;
};

type NormalizedFlashcard = {
  question: string;
  answer: string;
};

type CardCheckState = {
  userAnswer: string;
  result?: NotebookFlashcardsCheckResult;
  isAnswerVisible: boolean;
};

function normalizeFlashcards(value: NotebookFlashcard[] | null | undefined) {
  if (!value) {
    return [] as NormalizedFlashcard[];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return { question: item, answer: "" };
      }

      const question = item.question ?? item.front ?? item.term;
      const answer = item.answer ?? item.back ?? item.definition;

      if (typeof question !== "string") {
        return null;
      }

      return {
        question,
        answer: typeof answer === "string" ? answer : "",
      };
    })
    .filter((item): item is NormalizedFlashcard => item !== null);
}

function formatScore(score?: number) {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return null;
  }

  const normalizedScore =
    score > 1 ? Math.max(0, Math.min(100, score)) : Math.round(score * 100);

  return `${normalizedScore}%`;
}

function getCardStatusLabel(state?: CardCheckState) {
  if (!state) {
    return "Не начато";
  }

  if (state.result) {
    return state.result.is_correct ? "Проверено: верно" : "Проверено";
  }

  if (state.userAnswer.trim()) {
    return "Ответ заполнен";
  }

  return "Не начато";
}

export function NotebookFlashcardsTab({
  flashcards: rawFlashcards,
  flashcardsCount,
  onFlashcardsCountChange,
  onGenerate,
  onCheck,
  isGenerating,
}: NotebookFlashcardsTabProps) {
  const flashcards = useMemo(
    () => normalizeFlashcards(rawFlashcards),
    [rawFlashcards],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [checkState, setCheckState] = useState<Record<number, CardCheckState>>(
    {},
  );
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  const flashcardsSignature = useMemo(
    () => JSON.stringify(flashcards),
    [flashcards],
  );

  useEffect(() => {
    setActiveIndex(0);
    setCheckState({});
    setPendingIndex(null);
  }, [flashcardsSignature]);

  const activeCard = flashcards[activeIndex];
  const activeCardState = checkState[activeIndex];
  const userAnswer = activeCardState?.userAnswer ?? "";
  const scoreLabel = formatScore(activeCardState?.result?.score);
  const canCheck = Boolean(activeCard?.answer.trim() && userAnswer.trim());

  async function handleCheck() {
    if (!activeCard || !canCheck) {
      return;
    }

    setPendingIndex(activeIndex);

    try {
      const result = await onCheck({
        question: activeCard.question,
        correctAnswer: activeCard.answer,
        userAnswer: userAnswer.trim(),
      });

      setCheckState((current) => ({
        ...current,
        [activeIndex]: {
          userAnswer,
          result,
          isAnswerVisible: true,
        },
      }));
    } catch {
      return;
    } finally {
      setPendingIndex(null);
    }
  }

  return (
    <div className="space-y-5">
      <NotebookModuleHeader
        actions={
          <>
            <Input
              className="w-full sm:w-28"
              max={50}
              min={1}
              onChange={(event) =>
                onFlashcardsCountChange(Number(event.target.value) || 1)
              }
              type="number"
              value={flashcardsCount}
            />
            <Button disabled={isGenerating} onClick={onGenerate} type="button">
              {isGenerating ? <Spinner /> : "Обновить карточки"}
            </Button>
          </>
        }
        description="Проверь себя по материалам блокнота: сформулируй ответ, отправь его на проверку и получи разбор."
        title="Флэш-карточки"
      />

      {flashcards.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-3">
            {flashcards.map((card, index) => {
              const state = checkState[index];
              const isActive = index === activeIndex;

              return (
                <button
                  key={`${card.question}-${index}`}
                  className={[
                    "w-full rounded-3xl border px-4 py-4 text-left transition-colors",
                    isActive
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-muted/35",
                  ].join(" ")}
                  onClick={() => setActiveIndex(index)}
                  type="button"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Карточка {index + 1}
                  </p>
                  <p className="mt-3 line-clamp-2 text-sm font-medium text-foreground">
                    {card.question}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {getCardStatusLabel(state)}
                  </p>
                </button>
              );
            })}
          </div>

          {activeCard ? (
            <div className="space-y-4 rounded-3xl border border-border bg-card px-6 py-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Карточка {activeIndex + 1} из {flashcards.length}
                  </p>
                  <h3 className="text-2xl font-semibold text-foreground">
                    {activeCard.question}
                  </h3>
                </div>

                <div className="flex gap-2">
                  <Button
                    disabled={activeIndex === 0}
                    onClick={() =>
                      setActiveIndex((current) => Math.max(0, current - 1))
                    }
                    type="button"
                    variant="outline"
                  >
                    Назад
                  </Button>
                  <Button
                    disabled={activeIndex === flashcards.length - 1}
                    onClick={() =>
                      setActiveIndex((current) =>
                        Math.min(flashcards.length - 1, current + 1),
                      )
                    }
                    type="button"
                    variant="outline"
                  >
                    Дальше
                  </Button>
                </div>
              </div>

              <Separator />

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`flashcard-answer-${activeIndex}`}>
                    Твой ответ
                  </FieldLabel>
                  <Textarea
                    id={`flashcard-answer-${activeIndex}`}
                    onChange={(event) =>
                      setCheckState((current) => ({
                        ...current,
                        [activeIndex]: {
                          ...current[activeIndex],
                          result: undefined,
                          userAnswer: event.target.value,
                        },
                      }))
                    }
                    placeholder="Напиши ответ своими словами. Система сравнит его с правильным и даст комментарий."
                    value={userAnswer}
                  />
                  <FieldDescription>
                    Сначала попробуй ответить сам, потом отправь ответ на
                    проверку.
                  </FieldDescription>
                </Field>
              </FieldGroup>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  disabled={pendingIndex === activeIndex || !canCheck}
                  onClick={() => void handleCheck()}
                  type="button"
                >
                  {pendingIndex === activeIndex ? (
                    <Spinner />
                  ) : (
                    "Проверить ответ"
                  )}
                </Button>
                <Button
                  onClick={() =>
                    setCheckState((current) => ({
                      ...current,
                      [activeIndex]: {
                        ...current[activeIndex],
                        userAnswer,
                        isAnswerVisible: true,
                      },
                    }))
                  }
                  type="button"
                  variant="outline"
                >
                  Показать эталонный ответ
                </Button>
              </div>

              {activeCardState?.result ? (
                <div
                  className={[
                    "rounded-3xl border px-5 py-5",
                    activeCardState.result.is_correct
                      ? "border-primary/30 bg-primary/10"
                      : "border-border bg-muted/30",
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {activeCardState.result.is_correct
                        ? "Ответ засчитан"
                        : "Нужно уточнить ответ"}
                    </p>
                    {scoreLabel ? (
                      <p className="text-sm text-muted-foreground">
                        Точность: {scoreLabel}
                      </p>
                    ) : null}
                  </div>
                  {activeCardState.result.feedback ? (
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {activeCardState.result.feedback}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {activeCardState?.isAnswerVisible ? (
                <div className="rounded-3xl border border-border bg-muted/25 px-5 py-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Эталонный ответ
                  </p>
                  <p className="mt-3 text-sm leading-7 text-foreground">
                    {activeCard.answer || "Для этой карточки ответ не пришел."}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : rawFlashcards ? (
        <div className="rounded-3xl border border-border bg-card px-6 py-5">
          <pre className="overflow-x-auto text-sm leading-6 text-muted-foreground">
            {JSON.stringify(rawFlashcards, null, 2)}
          </pre>
        </div>
      ) : (
        <ArtifactPlaceholder
          title="Карточек пока нет"
          description="Сгенерируй набор карточек, и они сохранятся в ответе конкретного блокнота."
        />
      )}
    </div>
  );
}
