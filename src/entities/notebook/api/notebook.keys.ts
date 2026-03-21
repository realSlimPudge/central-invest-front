export const notebookKeys = {
  all: ["notebooks"] as const,
  list: () => [...notebookKeys.all, "list"] as const,
  detail: (notebookId: string) =>
    [...notebookKeys.all, "detail", notebookId] as const,
  create: () => [...notebookKeys.all, "create"] as const,
  upload: () => [...notebookKeys.all, "upload"] as const,
  removeSource: () => [...notebookKeys.all, "remove-source"] as const,
  summary: () => [...notebookKeys.all, "summary"] as const,
  mindmap: () => [...notebookKeys.all, "mindmap"] as const,
  flashcards: () => [...notebookKeys.all, "flashcards"] as const,
  podcast: () => [...notebookKeys.all, "podcast"] as const,
};
