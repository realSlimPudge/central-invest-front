import { getRouteApi } from "@tanstack/react-router";

import { NotebookPage } from "./NotebookPage";

const notebookRouteApi = getRouteApi("/notebooks/$id");

export function NotebookRoutePage() {
  const { id } = notebookRouteApi.useParams();

  return <NotebookPage notebookId={id} />;
}
