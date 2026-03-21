import { Layers3 } from "lucide-react";
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
  const selectedNode = graph
    ? graph.nodeById[resolvedSelectedNodeId]
    : undefined;

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
        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="ring-1 ring-border/80">
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle className="text-xl text-[var(--text-h)]">
                  Карта понятий
                </CardTitle>
                <CardDescription className="mt-2 text-sm leading-6">
                  Наведи фокус на нужную ветку, увеличь масштаб и быстро
                  проверь, как бэкенд разложил знания по темам.
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Темы", value: graph.stats.topics },
                  { label: "Ветви", value: graph.stats.branches },
                  { label: "Листы", value: graph.stats.leaves },
                  { label: "Уровни", value: graph.stats.levels },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border bg-card px-3 py-2"
                  >
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[var(--text-h)]">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardHeader>

            <CardContent>
              <NotebookMindmapCanvas
                graph={graph}
                onSelectNode={setSelectedNodeId}
                selectedNodeId={resolvedSelectedNodeId}
              />
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="ring-1 ring-border/80">
              <CardHeader>
                <CardTitle className="text-xl text-[var(--text-h)]">
                  Фокус по узлу
                </CardTitle>
                <CardDescription>
                  Выделенный элемент карты и его роль в общей структуре.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedNode ? (
                  <>
                    <div className="rounded-2xl border border-border bg-muted/35 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {selectedNode.isRoot ? "Главная тема" : "Текущий узел"}
                      </p>
                      <p className="mt-2 text-lg font-semibold leading-7 text-[var(--text-h)]">
                        {selectedNode.title}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {selectedNode.isRoot
                          ? "Это корень всей карты. Отсюда расходятся основные направления анализа по блокноту."
                          : selectedNode.childrenCount > 0
                            ? `Узел раскрывается через ${selectedNode.childrenCount} подтем и ведет к ${selectedNode.descendantsCount} вложенным элементам.`
                            : "Это листовая тема. Дальше ветка не продолжается."}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Путь в карте
                      </p>
                      <p className="mt-3 text-sm leading-7 text-foreground">
                        {selectedNode.path.join(" / ")}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
                      {[
                        {
                          label: "Уровень",
                          value: selectedNode.depth + 1,
                        },
                        {
                          label: "Подтемы",
                          value: selectedNode.childrenCount,
                        },
                        {
                          label: "Ниже по ветке",
                          value: selectedNode.descendantsCount,
                        },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-2xl border border-border bg-card px-4 py-4"
                        >
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            {stat.label}
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-[var(--text-h)]">
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            <Card className="ring-1 ring-border/80">
              <CardHeader>
                <CardTitle className="text-xl text-[var(--text-h)]">
                  Как читать карту
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-4">
                  <Layers3 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p>
                    Корневая тема задает весь контекст блокнота, а каждый
                    следующий уровень показывает, как система дробит материал на
                    смысловые блоки.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card px-4 py-4">
                  Если видишь слишком широкие ветки или много листовых узлов без
                  глубины, это сигнал проверить качество источников или
                  перестроить карту после новых загрузок.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : rawMindmap ? (
        <Card className="ring-1 ring-border/80">
          <CardHeader>
            <CardTitle className="text-xl text-[var(--text-h)]">
              Ответ карты пока нестабилен
            </CardTitle>
            <CardDescription>
              Бэкенд вернул структуру, которая не совпала с ожидаемым форматом.
              Ниже оставляю сырой ответ для проверки.
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
