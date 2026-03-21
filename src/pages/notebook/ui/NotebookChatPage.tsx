import { useEffect, useMemo, useRef, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookOptions } from "@/entities/notebook/api/notebook.options";
import {
  normalizeChatHistory,
  type ChatMessage,
} from "@/features/notebook-chat/model/chat-history";
import { NotebookChatComposer } from "@/features/notebook-chat/ui/NotebookChatComposer";
import { NotebookChatThread } from "@/features/notebook-chat/ui/NotebookChatThread";
import { getNotebookErrorMessage } from "@/features/notebook-workspace/lib/notebook-ui";
import { getNotebookModuleAvailability } from "@/features/notebook-workspace/model/notebook-module-availability";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import { NotebookModuleUnavailable } from "@/features/notebook-workspace/ui/NotebookModuleUnavailable";
import { Button } from "@/shared/components/ui/button";
import { ChatLayout } from "@/shared/components/ui/chat";
import { Card, CardContent } from "@/shared/components/ui/card";
import { createMessageId } from "@/shared/lib/createUUID";

export function NotebookChatPage() {
  const { notebookId, notebook } = useNotebookRoute();
  const moduleAvailability = getNotebookModuleAvailability(notebook, "chat");
  const chatHistoryQuery = useQuery({
    ...notebookOptions.chat(notebookId),
    enabled: Boolean(notebookId) && moduleAvailability.enabled,
  });
  const clearHistoryMutation = useMutation({
    mutationKey: [...notebookOptions.chat(notebookId).queryKey, "clear"],
    mutationFn: () => notebookApi.clearChatHistory(notebookId),
    onSuccess: async () => {
      setSessionMessages([]);
      await chatHistoryQuery.refetch();
      toast.success("История чата очищена");
    },
    onError: (error) => {
      toast.error(
        getNotebookErrorMessage(error, "Не удалось очистить историю чата"),
      );
    },
  });

  const remoteMessages = useMemo(
    () => normalizeChatHistory(chatHistoryQuery.data),
    [chatHistoryQuery.data],
  );
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[] | null>(
    null,
  );
  const messages = sessionMessages ?? remoteMessages;
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isStreaming]);

  const handleSend = async (query: string) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery || isStreaming) {
      return;
    }

    const currentMessages = sessionMessages ?? remoteMessages;
    const history = currentMessages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmedQuery,
      sources: [],
    };
    const assistantMessageId = createMessageId();

    setSessionMessages([
      ...currentMessages,
      userMessage,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        sources: [],
      },
    ]);
    setInput("");

    const controller = new AbortController();
    setAbortController(controller);
    setIsStreaming(true);

    try {
      await notebookApi.streamChat(
        notebookId,
        {
          query: trimmedQuery,
          history,
        },
        {
          signal: controller.signal,
          onDelta: ({ delta, sources }) => {
            setSessionMessages((prev) => {
              const baseMessages = prev ?? currentMessages;

              return baseMessages.map((message) => {
                if (message.id !== assistantMessageId) {
                  return message;
                }

                return {
                  ...message,
                  content: `${message.content}${delta ?? ""}`,
                  sources: Array.from(
                    new Set([...(message.sources ?? []), ...(sources ?? [])]),
                  ),
                };
              });
            });
          },
        },
      );

      void chatHistoryQuery.refetch();
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      setSessionMessages((prev) => {
        const baseMessages = prev ?? currentMessages;

        return baseMessages.map((message) => {
          if (message.id !== assistantMessageId) {
            return message;
          }

          return {
            ...message,
            content:
              message.content ||
              "Не удалось получить ответ. Попробуй повторить запрос или переформулировать вопрос.",
          };
        });
      });
      toast.error(getNotebookErrorMessage(error, "Ошибка при работе чата"));
    } finally {
      setIsStreaming(false);
      setAbortController(null);
    }
  };

  if (!moduleAvailability.enabled) {
    return (
      <NotebookModuleUnavailable
        notebookId={notebookId}
        reason={moduleAvailability.reason ?? "Модуль временно недоступен."}
        title="Чат"
      />
    );
  }

  return (
    <div className="space-y-6">
      <NotebookModuleHeader
        actions={
          <Button
            disabled={
              isStreaming ||
              clearHistoryMutation.isPending ||
              messages.length === 0
            }
            onClick={() => void clearHistoryMutation.mutateAsync()}
            type="button"
            variant="outline"
          >
            <Trash2 className="size-4" />
            Очистить историю
          </Button>
        }
        description="Задавай вопросы по текущему набору документов. История подтягивается из сервера, а новый ответ по-прежнему приходит потоком."
        title="Чат по блокноту"
      />
      <Card className="ring-1 ring-border/80 bg-card">
        <CardContent>
          <ChatLayout>
            <NotebookChatThread
              isHistoryPending={chatHistoryQuery.isPending}
              isStreaming={isStreaming}
              messages={messages}
              threadEndRef={threadEndRef}
            />
            <NotebookChatComposer
              input={input}
              isStreaming={isStreaming}
              onInputChange={setInput}
              onSend={() => void handleSend(input)}
              onStop={() => abortController?.abort()}
            />
          </ChatLayout>
        </CardContent>
      </Card>
    </div>
  );
}
