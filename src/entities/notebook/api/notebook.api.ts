import { apiClient } from "@/shared/api/api-client";
import { API_BASE_URL } from "@/shared/constants/api";
import { getAccessToken } from "@/shared/lib/access-token";

import type {
  CreateNotebookBody,
  NotebookChatHistoryResponse,
  MeRes,
  MindmapNode,
  Notebook,
  NotebookCompareBody,
  NotebookCompareResult,
  NotebookContourBody,
  NotebookFlashcardsBody,
  NotebookFlashcardsCheckBody,
  NotebookFlashcardsCheckResult,
  NotebookPodcastBody,
  NotebookPresentation,
  NotebookPresentationBody,
  NotebookQuestions,
  NotebookQuestionsBody,
  NotebookSearchBody,
  NotebookSearchResult,
  NotebookSummaryBody,
  PodcastResponse,
  UpdateNotebookBody,
} from "./dto/notebook.types";

export const notebookApi = {
  list: () => apiClient.request<MeRes>({ path: "notebooks" }),
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
  setContour: (notebookId: string, body: NotebookContourBody) =>
    apiClient.request<Notebook>({
      method: "PATCH",
      path: `notebooks/${notebookId}/contour`,
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
  transcribeSource: (notebookId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.request<Record<string, unknown>>({
      method: "POST",
      path: `notebooks/${notebookId}/sources/transcribe`,
      body: formData,
    });
  },
  removeSource: (notebookId: string, sourceId: string) =>
    apiClient.request<void>({
      method: "DELETE",
      path: `notebooks/${notebookId}/sources/${sourceId}`,
    }),
  getChat: (notebookId: string) =>
    apiClient.request<NotebookChatHistoryResponse>({
      path: `notebooks/${notebookId}/chat/history`,
    }),
  clearChatHistory: (notebookId: string) =>
    apiClient.request<void>({
      method: "DELETE",
      path: `notebooks/${notebookId}/chat/history`,
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
  contract: (notebookId: string) =>
    apiClient.request<Record<string, unknown>>({
      method: "POST",
      path: `notebooks/${notebookId}/contract`,
    }),
  knowledgeGraph: (notebookId: string) =>
    apiClient.request<Record<string, unknown>>({
      method: "POST",
      path: `notebooks/${notebookId}/knowledge-graph`,
    }),
  timeline: (notebookId: string) =>
    apiClient.request<Record<string, unknown>>({
      method: "POST",
      path: `notebooks/${notebookId}/timeline`,
    }),
  questions: (notebookId: string, body: NotebookQuestionsBody) =>
    apiClient.request<NotebookQuestions>({
      method: "POST",
      path: `notebooks/${notebookId}/questions`,
      body,
    }),
  presentationPreview: (notebookId: string, body: NotebookPresentationBody) =>
    apiClient.request<NotebookPresentation>({
      method: "POST",
      path: `notebooks/${notebookId}/presentation/preview`,
      body,
    }),
  presentationDownload: (notebookId: string, body: NotebookPresentationBody) =>
    apiClient.request<Blob>({
      method: "POST",
      path: `notebooks/${notebookId}/presentation/download`,
      body,
      responseType: "blob",
    }),
  checkFlashcard: (notebookId: string, body: NotebookFlashcardsCheckBody) =>
    apiClient.request<NotebookFlashcardsCheckResult>({
      method: "POST",
      path: `notebooks/${notebookId}/flashcards/check`,
      body,
    }),
  search: (body: NotebookSearchBody) =>
    apiClient.request<NotebookSearchResult>({
      method: "POST",
      path: "notebooks/search",
      body,
    }),
  compare: (body: NotebookCompareBody) =>
    apiClient.request<NotebookCompareResult>({
      method: "POST",
      path: "notebooks/compare",
      body,
    }),
  async streamChat(
    notebookId: string,
    body: { query: string; history?: Array<{ role: string; content: string }> },
    options: {
      signal?: AbortSignal;
      onDelta: (payload: { delta?: string; sources?: string[] }) => void;
    },
  ) {
    const response = await fetch(
      `${API_BASE_URL}/notebooks/${notebookId}/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
        body: JSON.stringify(body),
        signal: options.signal,
      },
    );

    if (!response.ok || !response.body) {
      throw new Error("Не удалось получить ответ чата");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() ?? "";

      for (const chunk of chunks) {
        const line = chunk
          .split("\n")
          .find((item) => item.trim().startsWith("data: "));

        if (!line) {
          continue;
        }

        const data = line.slice(6).trim();

        if (!data || data === "[DONE]") {
          continue;
        }

        try {
          const payload = JSON.parse(data) as {
            delta?: string;
            sources?: string[];
          };

          options.onDelta(payload);
        } catch {
          // Игнорируем битые фрагменты стрима и продолжаем чтение.
        }
      }
    }
  },
};
