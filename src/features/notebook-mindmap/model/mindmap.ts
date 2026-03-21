import { type Edge, type Node, Position } from "@xyflow/react";
import { hierarchy, tree, type HierarchyNode } from "d3-hierarchy";

import type {
  MindmapNode,
  Notebook,
} from "@/entities/notebook/api/dto/notebook.types";

const DEFAULT_ROOT_TITLE = "Карта блокнота";
const X_PADDING = 112;
const Y_PADDING = 96;
const HORIZONTAL_SPACING = 360;
const VERTICAL_SPACING = 152;
const TITLE_KEYS = ["title", "name", "label", "topic", "text"] as const;
const CHILD_KEYS = [
  "children",
  "items",
  "nodes",
  "branches",
  "subtopics",
  "sub_topics",
  "topics",
  "sections",
] as const;

export type MindmapGraphStats = {
  topics: number;
  branches: number;
  leaves: number;
  levels: number;
};

export type MindmapFlowNodeData = {
  title: string;
  depth: number;
  childrenCount: number;
  descendantsCount: number;
  path: string[];
  isRoot: boolean;
};

export type MindmapFlowNode = Node<MindmapFlowNodeData, "topic">;
export type MindmapFlowEdge = Edge;

export type MindmapGraph = {
  nodes: MindmapFlowNode[];
  edges: MindmapFlowEdge[];
  nodeById: Record<string, MindmapFlowNodeData>;
  rootId: string;
  stats: MindmapGraphStats;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseMindmapChildren(value: unknown): MindmapNode[] {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => parseMindmapNode(item, `Тема ${index + 1}`))
      .filter((item): item is MindmapNode => Boolean(item));
  }

  if (typeof value === "string") {
    return [{ title: value, children: [] }];
  }

  if (!isRecord(value)) {
    return [];
  }

  const hasStructuredTitle = TITLE_KEYS.some(
    (key) => typeof value[key] === "string",
  );
  if (hasStructuredTitle) {
    const childNode = parseMindmapNode(value);
    return childNode ? [childNode] : [];
  }

  return Object.entries(value)
    .map(([key, childValue]) => parseMindmapNode(childValue, key))
    .filter((item): item is MindmapNode => Boolean(item));
}

function parseMindmapNode(
  value: unknown,
  fallbackTitle?: string,
): MindmapNode | null {
  if (typeof value === "string") {
    return {
      title: value,
      children: [],
    };
  }

  if (Array.isArray(value)) {
    const children = parseMindmapChildren(value);
    if (children.length === 0) {
      return null;
    }

    return {
      title: fallbackTitle ?? DEFAULT_ROOT_TITLE,
      children,
    };
  }

  if (!isRecord(value)) {
    return null;
  }

  for (const key of TITLE_KEYS) {
    if (typeof value[key] !== "string") {
      continue;
    }

    const title = value[key];
    const childrenKey = CHILD_KEYS.find((childKey) => childKey in value);
    const children = childrenKey
      ? parseMindmapChildren(value[childrenKey])
      : [];

    return {
      title,
      children,
    };
  }

  const entries = Object.entries(value);
  if (entries.length === 1) {
    const [title, childValue] = entries[0];
    const children = parseMindmapChildren(childValue);

    return {
      title,
      children,
    };
  }

  const children = entries
    .map(([title, childValue]) => parseMindmapNode(childValue, title))
    .filter((item): item is MindmapNode => Boolean(item));

  if (children.length === 0) {
    return null;
  }

  return {
    title: fallbackTitle ?? DEFAULT_ROOT_TITLE,
    children,
  };
}

export function normalizeMindmap(value: Notebook["mindmap"]) {
  return parseMindmapNode(value);
}

export function buildMindmapGraph(rootNode: MindmapNode): MindmapGraph {
  const root = hierarchy(rootNode, (node: MindmapNode) => node.children ?? []);
  const layout = tree<MindmapNode>()
    .nodeSize([VERTICAL_SPACING, HORIZONTAL_SPACING])
    .separation(
      (left: HierarchyNode<MindmapNode>, right: HierarchyNode<MindmapNode>) =>
        left.parent === right.parent ? 1 : 1.15,
    );

  const nodeIds = new WeakMap<object, string>();
  nodeIds.set(root, "root");

  root.eachBefore((node: HierarchyNode<MindmapNode>) => {
    if (!node.parent) {
      return;
    }

    const parentId = nodeIds.get(node.parent) ?? "root";
    const siblingIndex =
      node.parent.children?.findIndex(
        (item: HierarchyNode<MindmapNode>) => item === node,
      ) ?? 0;
    nodeIds.set(node, `${parentId}-${siblingIndex}`);
  });

  layout(root);

  let minX = Number.POSITIVE_INFINITY;
  root.each((node: HierarchyNode<MindmapNode>) => {
    minX = Math.min(minX, node.x ?? 0);
  });

  const nodes: MindmapFlowNode[] = [];
  const edges: MindmapFlowEdge[] = [];
  const nodeById: Record<string, MindmapFlowNodeData> = {};

  root.each((node: HierarchyNode<MindmapNode>) => {
    const id = nodeIds.get(node) ?? "root";
    const parentId = node.parent ? (nodeIds.get(node.parent) ?? "root") : null;
    const data: MindmapFlowNodeData = {
      title: node.data.title,
      depth: node.depth,
      childrenCount: node.children?.length ?? 0,
      descendantsCount: node.descendants().length - 1,
      path: node
        .ancestors()
        .reverse()
        .map((item: HierarchyNode<MindmapNode>) => item.data.title),
      isRoot: node.depth === 0,
    };

    nodeById[id] = data;

    const layoutX = node.x ?? 0;
    const layoutY = node.y ?? 0;

    nodes.push({
      id,
      type: "topic",
      position: {
        x: layoutY + X_PADDING,
        y: layoutX - minX + Y_PADDING,
      },
      data,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      draggable: false,
      selectable: true,
    });

    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: "smoothstep",
        style: {
          stroke: "var(--border)",
          strokeWidth: 1.5,
        },
        selectable: false,
      });
    }
  });

  return {
    nodes,
    edges,
    nodeById,
    rootId: "root",
    stats: {
      topics: root.descendants().length,
      branches: root
        .descendants()
        .filter(
          (node: HierarchyNode<MindmapNode>) =>
            (node.children?.length ?? 0) > 0,
        ).length,
      leaves: root.leaves().length,
      levels: root.height + 1,
    },
  };
}
