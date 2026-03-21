import { useMemo, useState } from "react";

import type { Notebook } from "@/entities/notebook/api/dto/notebook.types";
import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import {
  buildMindmapGraph,
  normalizeMindmap,
} from "@/features/notebook-mindmap/model/mindmap";
import { NotebookMindmapCanvas } from "@/features/notebook-mindmap/ui/NotebookMindmapCanvas";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Spinner } from "@/shared/components/ui/spinner";

type NotebookMindmapTabProps = {
  mindmap: Notebook["mindmap"];
  onGenerate: () => void;
  isPending: boolean;
};

export function NotebookMindmapTab({
  mindmap: rawMindmap,
  onGenerate,
  isPending,
}: NotebookMindmapTabProps) {
  const mindmap = useMemo(() => normalizeMindmap(rawMindmap), [rawMindmap]);
  const graph = useMemo(
    () => (mindmap ? buildMindmapGraph(mindmap) : null),
    [mindmap],
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");
  const resolvedSelectedNodeId = graph
    ? selectedNodeId && graph.nodeById[selectedNodeId]
      ? selectedNodeId
      : graph.rootId
    : "";
  return (
    <div className="space-y-5">
      <NotebookModuleHeader
        actions={
          <Button disabled={isPending} onClick={onGenerate} type="button">
            {isPending ? <Spinner /> : "Перестроить карту"}
          </Button>
        }
        description="Собираем темы, подтемы и логические ветки в одну карту. Холст можно масштабировать, а справа читать фокус по выбранному узлу."
        title="Майнд-карта по материалам блокнота"
      />

      {graph ? (
        <div className="grid gap-5 ">
          <NotebookMindmapCanvas
            graph={graph}
            onSelectNode={setSelectedNodeId}
            selectedNodeId={resolvedSelectedNodeId}
          />
        </div>
      ) : rawMindmap ? (
        <Card className="ring-1 ring-border/80">
          <CardHeader>
            <CardTitle className="text-xl text-[var(--text-h)]">
              Карта пока отображается не полностью
            </CardTitle>
            <CardDescription>
              Структура пришла в нестандартном виде. Ниже показываем данные как
              есть.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-3xl border border-border bg-card px-5 py-4 text-sm leading-6 text-muted-foreground">
              {JSON.stringify(rawMindmap, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <ArtifactPlaceholder
          title="Майнд-карта пока не построена"
          description="Запусти генерацию, и блокнот разложит материалы на темы, подтемы и отдельные ветки знаний."
        />
      )}
    </div>
  );
}
