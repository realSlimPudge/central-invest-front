import type {
  NotebookChatHistoryResponse,
  NotebookChatHistoryItem,
  NotebookChatSource,
} from "@/entities/notebook/api/dto/notebook.types";

type NotebookChatHistoryRecord = Exclude<NotebookChatHistoryItem, string>;

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeSources(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeSource(item as NotebookChatSource))
    .filter((item): item is string => Boolean(item));
}

function normalizeSource(value: NotebookChatSource | undefined) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  const sourceText =
    value.text ??
    value.content ??
    value.quote ??
    value.chunk ??
    value.source ??
    value.filename;

  return typeof sourceText === "string" ? sourceText : null;
}

function createMessage(
  role: "user" | "assistant",
  content: string,
  sources: string[],
  fallbackId: string,
): ChatMessage | null {
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    return null;
  }

  return {
    id: fallbackId,
    role,
    content: trimmedContent,
    sources,
  };
}

function normalizeItemPair(
  item: NotebookChatHistoryRecord,
  index: number,
): ChatMessage[] {
  const sources = normalizeSources(
    item.sources ?? item.references ?? item.citations ?? item.contexts,
  );
  const messages: ChatMessage[] = [];

  const userContent =
    item.query ??
    item.question ??
    item.prompt ??
    item.user_message ??
    item.user;

  const assistantContent =
    item.answer ?? item.response ?? item.assistant_message ?? item.assistant;

  if (typeof userContent === "string") {
    const userMessage = createMessage(
      "user",
      userContent,
      [],
      `${index}-user-pair`,
    );

    if (userMessage) {
      messages.push(userMessage);
    }
  }

  if (typeof assistantContent === "string") {
    const assistantMessage = createMessage(
      "assistant",
      assistantContent,
      sources,
      `${index}-assistant-pair`,
    );

    if (assistantMessage) {
      messages.push(assistantMessage);
    }
  }

  return messages;
}

function normalizeSingleItem(
  item: NotebookChatHistoryItem,
  index: number,
): ChatMessage[] {
  if (typeof item === "string") {
    const message = createMessage("assistant", item, [], `${index}-assistant`);
    return message ? [message] : [];
  }

  if (!isRecord(item)) {
    return [];
  }

  const record = item as NotebookChatHistoryRecord;
  const role =
    record.role === "user"
      ? "user"
      : record.role === "assistant"
        ? "assistant"
        : null;
  const content = record.content ?? record.text ?? record.message;

  if (role && typeof content === "string") {
    const message = createMessage(
      role,
      content,
      role === "assistant"
        ? normalizeSources(
            record.sources ??
              record.references ??
              record.citations ??
              record.contexts,
          )
        : [],
      typeof record.id === "string" ? record.id : `${index}-${role}`,
    );

    return message ? [message] : [];
  }

  return normalizeItemPair(record, index);
}

function extractRawHistory(
  value: NotebookChatHistoryResponse | null | undefined,
): NotebookChatHistoryItem[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (!isRecord(value)) {
    return [];
  }

  const candidateKeys = [
    "messages",
    "history",
    "items",
    "chat",
    "data",
  ] as const;
  for (const key of candidateKeys) {
    if (Array.isArray(value[key])) {
      return value[key] as NotebookChatHistoryItem[];
    }
  }

  return normalizeItemPair(value as NotebookChatHistoryRecord, 0).length > 0
    ? [value as NotebookChatHistoryRecord]
    : [];
}

export function normalizeChatHistory(
  value: NotebookChatHistoryResponse | null | undefined,
) {
  return extractRawHistory(value).flatMap((item, index) =>
    normalizeSingleItem(item, index),
  );
}
