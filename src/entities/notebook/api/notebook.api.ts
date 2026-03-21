import { apiClient } from "@/shared/api/api-client";

import type {
  CreateNotebookBody,
  MindmapNode,
  Notebook,
  NotebookFlashcardsBody,
  NotebookPodcastBody,
  NotebookSummaryBody,
  PodcastResponse,
  UpdateNotebookBody,
} from "./dto/notebook.types";

export const notebookApi = {
  list: () => apiClient.request<Notebook[]>({ path: "notebooks" }),
  getOne: (notebookId: string) =>
    apiClient.request<Notebook>({ path: `notebooks/${notebookId}` }),
  create: (body: CreateNotebookBody) =>
    apiClient.request<Notebook>({
      method: "POST",
      path: "notebooks",
      body,
    }),
  update: (notebookId: string, body: UpdateNotebookBody) =>
    apiClient.request<Notebook>({
      method: "PATCH",
      path: `notebooks/${notebookId}`,
      body,
    }),
  delete: (notebookId: string) =>
    apiClient.request<void>({
      method: "DELETE",
      path: `notebooks/${notebookId}`,
    }),
  uploadSource: (notebookId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.request<Record<string, unknown>>({
      method: "POST",
      path: `notebooks/${notebookId}/sources`,
      body: formData,
    });
  },
  removeSource: (notebookId: string, sourceId: string) =>
    apiClient.request<void>({
      method: "DELETE",
      path: `notebooks/${notebookId}/sources/${sourceId}`,
    }),
  summary: (notebookId: string, body: NotebookSummaryBody) =>
    apiClient.request<Record<string, unknown>>({
      method: "POST",
      path: `notebooks/${notebookId}/summary`,
      body,
    }),
  mindmap: (notebookId: string) =>
    apiClient.request<MindmapNode>({
      method: "POST",
      path: `notebooks/${notebookId}/mindmap`,
    }),
  flashcards: (notebookId: string, body: NotebookFlashcardsBody) =>
    apiClient.request<Record<string, unknown>>({
      method: "POST",
      path: `notebooks/${notebookId}/flashcards`,
      body,
    }),
  podcast: (notebookId: string, body: NotebookPodcastBody) =>
    apiClient.request<PodcastResponse>({
      method: "POST",
      path: `notebooks/${notebookId}/podcast`,
      body,
    }),
};
