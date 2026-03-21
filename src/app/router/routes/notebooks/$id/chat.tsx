import { createFileRoute } from "@tanstack/react-router";

import { NotebookChatPage } from "@/pages/notebook/ui/NotebookChatPage";

export const Route = createFileRoute("/notebooks/$id/chat")({
  component: NotebookChatPage,
});
