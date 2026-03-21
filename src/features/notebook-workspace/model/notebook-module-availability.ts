import type {
  Notebook,
  NotebookSource,
} from "@/entities/notebook/api/dto/notebook.types";

export type NotebookModuleId =
  | "overview"
  | "sources"
  | "chat"
  | "summary"
  | "mindmap"
  | "flashcards"
  | "podcast"
  | "contract"
  | "knowledge-graph"
  | "timeline"
  | "questions"
  | "presentation";

export type NotebookModuleAvailability = {
  enabled: boolean;
  reason?: string;
};

export type NotebookModuleAvailabilityMap = Record<
  NotebookModuleId,
  NotebookModuleAvailability
>;

type NotebookSignals = {
  readySourcesCount: number;
  docTypes: string[];
  tags: string[];
  hasClassification: boolean;
};

type ModuleRule = {
  guidance: string;
  docTypeKeywords: string[];
  tagKeywords: string[];
};

const modulesRequiringSources = new Set<NotebookModuleId>([
  "chat",
  "summary",
  "mindmap",
  "flashcards",
  "podcast",
  "contract",
  "knowledge-graph",
  "timeline",
  "questions",
  "presentation",
]);

const moduleRules: Partial<Record<NotebookModuleId, ModuleRule>> = {
  contract: {
    guidance:
      "Этот модуль открывается для договоров, соглашений и других юридических документов.",
    docTypeKeywords: ["договор", "судебный документ"],
    tagKeywords: [
      "договор",
      "контракт",
      "соглаш",
      "оферт",
      "ипотек",
      "кредит",
      "займ",
      "лизинг",
      "поручител",
      "аренд",
      "поставка",
      "страхов",
      "суд",
    ],
  },
};

function normalizeSignalValue(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function collectSourceSignals(sources: NotebookSource[]) {
  const readySources = sources.filter(
    (source) => !source.status || source.status === "ready",
  );

  const docTypes = unique(
    readySources.map((source) => normalizeSignalValue(source.doc_type)),
  );
  const tags = unique(
    readySources.flatMap((source) =>
      Array.isArray(source.tags)
        ? source.tags.map((tag) => normalizeSignalValue(tag))
        : [],
    ),
  );

  return {
    readySourcesCount: readySources.length,
    docTypes,
    tags,
  };
}

function getNotebookSignals(notebook: Notebook | undefined): NotebookSignals {
  if (!notebook) {
    return {
      readySourcesCount: 0,
      docTypes: [],
      tags: [],
      hasClassification: false,
    };
  }

  const sourceSignals = collectSourceSignals(notebook.sources);
  const topLevelDocType = normalizeSignalValue(notebook.doc_type);
  const topLevelTags = Array.isArray(notebook.tags)
    ? notebook.tags.map((tag) => normalizeSignalValue(tag))
    : [];

  const docTypes = unique([
    ...sourceSignals.docTypes,
    ...(topLevelDocType ? [topLevelDocType] : []),
  ]);
  const tags = unique([...sourceSignals.tags, ...topLevelTags]);

  return {
    readySourcesCount: sourceSignals.readySourcesCount,
    docTypes,
    tags,
    hasClassification: docTypes.length > 0 || tags.length > 0,
  };
}

function matchesKeywords(values: string[], keywords: string[]) {
  return values.some((value) =>
    keywords.some((keyword) => value.includes(keyword)),
  );
}

function formatDetectedTypes(docTypes: string[]) {
  if (docTypes.length === 0) {
    return "без определенного типа";
  }

  return docTypes.slice(0, 3).join(", ");
}

export function getNotebookModuleAvailability(
  notebook: Notebook | undefined,
  moduleId: NotebookModuleId,
): NotebookModuleAvailability {
  if (!notebook) {
    return { enabled: true };
  }

  const signals = getNotebookSignals(notebook);

  if (
    modulesRequiringSources.has(moduleId) &&
    signals.readySourcesCount === 0
  ) {
    return {
      enabled: false,
      reason: "Сначала загрузи и дождись обработки хотя бы одного источника.",
    };
  }

  const rule = moduleRules[moduleId];

  if (!rule || !signals.hasClassification) {
    return { enabled: true };
  }

  const matches =
    matchesKeywords(signals.docTypes, rule.docTypeKeywords) ||
    matchesKeywords(signals.tags, rule.tagKeywords);

  if (matches) {
    return { enabled: true };
  }

  return {
    enabled: false,
    reason: `${rule.guidance} Сейчас блокнот распознан как: ${formatDetectedTypes(
      signals.docTypes,
    )}.`,
  };
}

export function getNotebookModuleAvailabilityMap(
  notebook: Notebook | undefined,
) {
  const moduleIds: NotebookModuleId[] = [
    "overview",
    "sources",
    "chat",
    "summary",
    "mindmap",
    "flashcards",
    "podcast",
    "contract",
    "knowledge-graph",
    "timeline",
    "questions",
    "presentation",
  ];

  return Object.fromEntries(
    moduleIds.map((moduleId) => [
      moduleId,
      getNotebookModuleAvailability(notebook, moduleId),
    ]),
  ) as NotebookModuleAvailabilityMap;
}
