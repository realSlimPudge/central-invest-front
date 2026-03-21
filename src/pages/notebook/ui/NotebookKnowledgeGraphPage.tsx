import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Network } from "lucide-react";
import { toast } from "sonner";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import type { NotebookKnowledgeGraph } from "@/entities/notebook/api/dto/notebook.types";
import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import { getNotebookErrorMessage } from "@/features/notebook-workspace/lib/notebook-ui";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

function asKnowledgeGraph(
  value: NotebookKnowledgeGraph | Record<string, unknown> | null | undefined,
) {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as NotebookKnowledgeGraph;
}

export function NotebookKnowledgeGraphPage() {
  const queryClient = useQueryClient();
  const { notebookId, notebook } = useNotebookRoute();
  const graph = asKnowledgeGraph(notebook?.knowledge_graph);
  const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph?.edges) ? graph.edges : [];

  const graphMutation = useMutation({
    mutationKey: notebookKeys.knowledgeGraph(),
    mutationFn: () => notebookApi.knowledgeGraph(notebookId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notebookKeys.detail(notebookId),
      });
      toast.success("Граф знаний обновлен");
    },
    onError: (error) => {
      toast.error(
        getNotebookErrorMessage(error, "Не удалось построить граф знаний"),
      );
    },
  });

  return (
    <div className="space-y-6">
      <NotebookModuleHeader
        actions={
          <Button
            disabled={graphMutation.isPending}
            onClick={() => void graphMutation.mutateAsync()}
            type="button"
          >
            <Network className="size-4" />
            {nodes.length > 0 ? "Обновить граф" : "Построить граф"}
          </Button>
        }
        description="Сущности и связи между ними, выделенные из документов блокнота."
        title="Граф знаний"
      />

      {nodes.length > 0 || edges.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="ring-1 ring-border/80">
            <CardHeader>
              <CardTitle className="text-xl text-[var(--text-h)]">
                Сущности
              </CardTitle>
              <CardDescription>
                Карточки узлов, выделенных из документов.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="rounded-3xl border border-border bg-card px-4 py-4"
                >
                  <p className="text-lg font-semibold text-[var(--text-h)]">
                    {node.label}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {node.type || "entity"}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="ring-1 ring-border/80">
            <CardHeader>
              <CardTitle className="text-xl text-[var(--text-h)]">
                Связи
              </CardTitle>
              <CardDescription>
                Как сущности связаны друг с другом внутри корпуса.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {edges.map((edge, index) => (
                <div
                  key={`${edge.source}-${edge.target}-${index}`}
                  className="rounded-2xl border border-border bg-card px-4 py-4"
                >
                  <p className="font-medium text-[var(--text-h)]">
                    {edge.source} → {edge.target}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {edge.label || "Связь без подписи"}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : notebook?.knowledge_graph ? (
        <Card className="ring-1 ring-border/80">
          <CardContent className="p-6">
            <pre className="overflow-x-auto text-sm leading-6 text-muted-foreground">
              {JSON.stringify(notebook.knowledge_graph, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <ArtifactPlaceholder
          title="Граф знаний пока не собран"
          description="Построй граф, чтобы увидеть сущности, термины и связи между ними в одной плоскости."
        />
      )}
    </div>
  );
}
