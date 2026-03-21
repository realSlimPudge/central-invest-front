import type { NotebookFlashcard } from "@/entities/notebook/api/dto/notebook.types";
import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Spinner } from "@/shared/components/ui/spinner";

type NotebookFlashcardsTabProps = {
  flashcards: NotebookFlashcard[] | null | undefined;
  flashcardsCount: number;
  onFlashcardsCountChange: (value: number) => void;
  onGenerate: () => void;
  isPending: boolean;
};

type NormalizedFlashcard = {
  question: string;
  answer: string;
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

export function NotebookFlashcardsTab({
  flashcards: rawFlashcards,
  flashcardsCount,
  onFlashcardsCountChange,
  onGenerate,
  isPending,
}: NotebookFlashcardsTabProps) {
  const flashcards = normalizeFlashcards(rawFlashcards);

  return (
    <div className="space-y-5">
      <NotebookModuleHeader
        actions={
          <>
            <Input
              className="w-28"
              max={50}
              min={1}
              onChange={(event) =>
                onFlashcardsCountChange(Number(event.target.value) || 1)
              }
              type="number"
              value={flashcardsCount}
            />
            <Button disabled={isPending} onClick={onGenerate} type="button">
              {isPending ? <Spinner /> : "Обновить карточки"}
            </Button>
          </>
        }
        description="Набор карточек для быстрого повторения по материалам блокнота."
        title="Флэш-карточки"
      />

      {flashcards.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {flashcards.map((card, index) => (
            <div
              key={`${card.question}-${index}`}
              className="rounded-3xl border border-border bg-card px-5 py-5"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Карточка {index + 1}
              </p>
              <p className="mt-4 text-lg font-semibold text-[var(--text-h)]">
                {card.question}
              </p>
              <Separator className="my-4" />
              <p className="text-sm leading-7 text-muted-foreground">
                {card.answer ||
                  "Ответ не указан явно, но карточка сохранена в блокноте."}
              </p>
            </div>
          ))}
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
