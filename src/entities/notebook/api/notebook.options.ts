import { mutationOptions, queryOptions } from "@tanstack/react-query";

import { notebookApi } from "./notebook.api";
import { notebookKeys } from "./notebook.keys";

export const notebookOptions = {
  list: () =>
    queryOptions({
      queryKey: notebookKeys.list(),
      queryFn: notebookApi.list,
      staleTime: 1000 * 30,
    }),
  detail: (notebookId: string) =>
    queryOptions({
      queryKey: notebookKeys.detail(notebookId),
      queryFn: () => notebookApi.getOne(notebookId),
    }),
  chat: (notebookId: string) =>
    queryOptions({
      queryKey: notebookKeys.chat(notebookId),
      queryFn: () => notebookApi.getChat(notebookId),
      staleTime: 1000 * 15,
      retry: false,
    }),
  create: () =>
    mutationOptions({
      mutationKey: notebookKeys.create(),
      mutationFn: notebookApi.create,
    }),
  uploadSource: () =>
    mutationOptions({
      mutationKey: notebookKeys.upload(),
      mutationFn: ({ notebookId, file }: { notebookId: string; file: File }) =>
        notebookApi.uploadSource(notebookId, file),
    }),
  transcribeSource: () =>
    mutationOptions({
      mutationKey: notebookKeys.transcribe(),
      mutationFn: ({ notebookId, file }: { notebookId: string; file: File }) =>
        notebookApi.transcribeSource(notebookId, file),
    }),
  removeSource: () =>
    mutationOptions({
      mutationKey: notebookKeys.removeSource(),
      mutationFn: ({
        notebookId,
        sourceId,
      }: {
        notebookId: string;
        sourceId: string;
      }) => notebookApi.removeSource(notebookId, sourceId),
    }),
};
