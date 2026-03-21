import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ScrollText } from "lucide-react";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import type { NotebookContract } from "@/entities/notebook/api/dto/notebook.types";
import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import { runNotebookRequestWithToast } from "@/features/notebook-workspace/lib/notebook-ui";
import { getNotebookModuleAvailability } from "@/features/notebook-workspace/model/notebook-module-availability";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import { NotebookModuleUnavailable } from "@/features/notebook-workspace/ui/NotebookModuleUnavailable";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

function asContract(
  value: NotebookContract | Record<string, unknown> | null | undefined,
) {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as NotebookContract;
}

function ContractList({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-border bg-card px-5 py-5">
      <p className="text-lg font-semibold text-[var(--text-h)]">{title}</p>
      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <div
            key={`${title}-${index}`}
            className="rounded-2xl bg-muted/35 px-4 py-3 text-sm leading-6 text-foreground"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function NotebookContractPage() {
  const queryClient = useQueryClient();
  const { notebookId, notebook } = useNotebookRoute();
  const moduleAvailability = getNotebookModuleAvailability(
    notebook,
    "contract",
  );
  const contract = asContract(notebook?.contract);

  const contractMutation = useMutation({
    mutationKey: notebookKeys.contract(),
    mutationFn: () => notebookApi.contract(notebookId),
  });

  const handleGenerate = async () =>
    runNotebookRequestWithToast({
      request: contractMutation.mutateAsync().then(async (result) => {
        await queryClient.invalidateQueries({
          queryKey: notebookKeys.detail(notebookId),
        });
        return result;
      }),
      loading: "Проводим анализ договора...",
      success: "Анализ договора обновлен",
      error: "Не удалось проанализировать договор",
    });

  if (!moduleAvailability.enabled) {
    return (
      <NotebookModuleUnavailable
        notebookId={notebookId}
        reason={moduleAvailability.reason ?? "Модуль временно недоступен."}
        title="Анализ договора"
      />
    );
  }

  return (
    <div className="space-y-6">
      <NotebookModuleHeader
        actions={
          <Button
            disabled={contractMutation.isPending}
            onClick={() => void handleGenerate()}
            type="button"
          >
            <ScrollText className="size-4" />
            {contract ? "Обновить анализ" : "Построить анализ"}
          </Button>
        }
        description="Извлечение сторон, предмета, ключевых условий, обязательств и зон риска."
        title="Анализ договора"
      />

      {contract ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
          <div className="space-y-6">
            <Card className="ring-1 ring-border/80">
              <CardHeader>
                <CardTitle className="text-xl text-[var(--text-h)]">
                  Предмет договора
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-foreground">
                  {typeof contract.subject === "string" && contract.subject
                    ? contract.subject
                    : "Предмет договора не выделен явно."}
                </p>
              </CardContent>
            </Card>

            {Array.isArray(contract.obligations) &&
              contract.obligations.length > 0 && (
                <Card className="ring-1 ring-border/80">
                  <CardHeader>
                    <CardTitle className="text-xl text-[var(--text-h)]">
                      Обязательства сторон
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {contract.obligations.map((item, index) => (
                      <div
                        key={`obligation-${index}`}
                        className="rounded-2xl border border-border bg-card px-4 py-4"
                      >
                        <p className="font-medium text-[var(--text-h)]">
                          {item.party || "Сторона"}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {item.text || "Описание не указано"}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
          </div>

          <div className="space-y-6">
            <ContractList title="Стороны" items={contract.parties} />
            <ContractList
              title="Ключевые условия"
              items={contract.key_conditions}
            />
            <ContractList title="Риски" items={contract.risks} />
            <ContractList title="Сроки" items={contract.deadlines} />
            <ContractList title="Штрафы и санкции" items={contract.penalties} />
          </div>
        </div>
      ) : notebook?.contract ? (
        <Card className="ring-1 ring-border/80">
          <CardContent className="p-6">
            <pre className="overflow-x-auto text-sm leading-6 text-muted-foreground">
              {JSON.stringify(notebook.contract, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <ArtifactPlaceholder
          title="Анализ договора пока не собран"
          description="Запусти обработку, и блокнот выделит стороны, обязательства, риски и сроки в удобной структуре."
        />
      )}
    </div>
  );
}
