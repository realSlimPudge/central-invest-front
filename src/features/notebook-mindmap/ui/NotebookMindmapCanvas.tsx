import "@xyflow/react/dist/style.css";
import "./notebook-mindmap.css";

import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type NodeProps,
} from "@xyflow/react";
import { GitBranchPlus, ScanSearch } from "lucide-react";
import { useMemo } from "react";

import type {
  MindmapFlowNode,
  MindmapGraph,
} from "@/features/notebook-mindmap/model/mindmap";
import { cn } from "@/shared/lib/utils";

type NotebookMindmapCanvasProps = {
  graph: MindmapGraph;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
};

function TopicNode({ data, selected }: NodeProps<MindmapFlowNode>) {
  return (
    <div
      className={cn(
        "relative w-72 rounded-[28px] border bg-card p-4 shadow-sm transition-all duration-200",
        data.isRoot
          ? "border-primary/20 bg-primary/5"
          : "border-border bg-card",
        selected
          ? "-translate-y-0.5 border-primary/25 shadow-lg ring-2 ring-primary/12"
          : "hover:border-primary/20 hover:shadow-md",
      )}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
              data.isRoot
                ? "border-primary/20 bg-primary/10 text-foreground"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            {data.isRoot ? "Главная тема" : `Уровень ${data.depth + 1}`}
          </span>
          <p className="text-sm font-semibold leading-6 text-foreground">
            {data.title}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {data.childrenCount}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <GitBranchPlus className="size-3.5" />
        {data.childrenCount > 0
          ? `${data.childrenCount} подтем и ${data.descendantsCount} узлов ниже`
          : "Листовая тема без вложений"}
      </div>
    </div>
  );
}

const nodeTypes = {
  topic: TopicNode,
};

export function NotebookMindmapCanvas({
  graph,
  selectedNodeId,
  onSelectNode,
}: NotebookMindmapCanvasProps) {
  const nodes = useMemo(
    () =>
      graph.nodes.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
      })),
    [graph.nodes, selectedNodeId],
  );

  return (
    <div className="notebook-mindmap-flow h-[68dvh] min-h-[420px] w-full overflow-hidden rounded-[28px] border border-border bg-card sm:h-[min(72vh,820px)] sm:min-h-[560px]">
      <ReactFlow
        fitView
        fitViewOptions={{
          padding: 0.18,
          maxZoom: 1,
        }}
        minZoom={0.35}
        maxZoom={1.5}
        nodes={nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onSelectNode(node.id)}
        nodesDraggable={false}
        nodesConnectable={false}
        selectionOnDrag={false}
        elevateEdgesOnSelect={false}
        elevateNodesOnSelect={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        className="bg-transparent"
      >
        <Background color="var(--border)" gap={28} lineWidth={1} />

        <Controls position="bottom-right" showInteractive={false} />
      </ReactFlow>

      <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-full border border-border bg-card/95 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur sm:left-4 sm:top-4">
        <span className="inline-flex items-center gap-2">
          <ScanSearch className="size-3.5" />
          Двигай холст и выбирай узлы
        </span>
      </div>
    </div>
  );
}
