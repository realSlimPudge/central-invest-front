import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { notebookOptions } from "@/entities/notebook/api/notebook.options";

const notebookRouteApi = getRouteApi("/notebooks/$id");

export function useNotebookRoute() {
  const { id: notebookId } = notebookRouteApi.useParams();
  const notebookQuery = useQuery(notebookOptions.detail(notebookId));

  return {
    notebookId,
    notebookQuery,
    notebook: notebookQuery.data,
  };
}
