import { createFileRoute } from "@tanstack/react-router";

import { NotebookPodcastPage } from "@/pages/notebook/ui/NotebookPodcastPage";

export const Route = createFileRoute("/notebooks/$id/podcast")({
  component: NotebookPodcastPage,
});
