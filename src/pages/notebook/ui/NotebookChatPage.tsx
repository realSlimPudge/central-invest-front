import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Bot, StopCircle, Trash2, User } from "lucide-react";
import { toast } from "sonner";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookOptions } from "@/entities/notebook/api/notebook.options";
import {
  normalizeChatHistory,
  type ChatMessage,
} from "@/features/notebook-chat/model/chat-history";
import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import {
  getContourLabel,
  getNotebookErrorMessage,
} from "@/features/notebook-workspace/lib/notebook-ui";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

const starterPrompts = [
  "Сделай краткий обзор ключевых идей в материалах.",
  "Какие риски и спорные моменты видны в документах?",
  "Сравни главные условия и ограничения, которые встречаются в источниках.",
];

export function NotebookChatPage() {
  const { notebookId, notebook } = useNotebookRoute();
  const chatHistoryQuery = useQuery({
    ...notebookOptions.chat(notebookId),
    enabled: Boolean(notebookId),
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

  const lastAssistantMessage = useMemo(
    () =>
      [...messages].reverse().find((message) => message.role === "assistant"),
    [messages],
  );

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
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedQuery,
      sources: [],
    };
    const assistantMessageId = crypto.randomUUID();

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

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
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
          <CardContent className="space-y-4">
            <div className="max-h-[62vh] space-y-4 overflow-y-auto rounded-3xl border border-border bg-muted/20 px-4 py-4">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "rounded-3xl border px-4 py-4",
                      message.role === "user"
                        ? "ml-auto max-w-3xl border-border bg-card"
                        : "mr-auto max-w-4xl border-primary/15 bg-primary/5",
                    )}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <span
                        className={cn(
                          "flex size-8 items-center justify-center rounded-2xl border",
                          message.role === "user"
                            ? "border-border bg-muted"
                            : "border-primary/20 bg-primary/10",
                        )}
                      >
                        {message.role === "user" ? (
                          <User className="size-4" />
                        ) : (
                          <Bot className="size-4" />
                        )}
                      </span>
                      {message.role === "user" ? "Ты" : "Ассистент"}
                    </div>

                    <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
                      {message.content ||
                        (message.role === "assistant" && isStreaming
                          ? "Собираю ответ..."
                          : "")}
                    </div>

                    {message.role === "assistant" &&
                      message.sources.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            Опора на источники
                          </p>
                          <div className="space-y-2">
                            {message.sources
                              .slice(0, 3)
                              .map((source, index) => (
                                <div
                                  key={`${message.id}-${index}`}
                                  className="rounded-2xl border border-border bg-card px-3 py-3 text-sm leading-6 text-muted-foreground"
                                >
                                  {source}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                ))
              ) : chatHistoryQuery.isPending ? (
                <div className="rounded-3xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
                  Загружаю историю диалога...
                </div>
              ) : (
                <ArtifactPlaceholder
                  title="Чат пока пустой"
                  description="Начни с одного вопроса по документам — например про риски, сроки, расхождения или ключевые тезисы."
                />
              )}
              <div ref={threadEndRef} />
            </div>

            <div className="rounded-3xl border border-border bg-card px-4 py-4">
              <textarea
                className="min-h-28 w-full resize-none bg-transparent text-sm leading-7 text-foreground outline-none placeholder:text-muted-foreground"
                disabled={isStreaming}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend(input);
                  }
                }}
                placeholder="Например: какие обязательства и риски встречаются в этих документах?"
                value={input}
              />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-muted-foreground">
                  `Enter` — отправить, `Shift + Enter` — новая строка.
                </p>
                <div className="flex gap-3">
                  {isStreaming && (
                    <Button
                      onClick={() => abortController?.abort()}
                      type="button"
                      variant="outline"
                    >
                      <StopCircle className="size-4" />
                      Остановить
                    </Button>
                  )}
                  <Button
                    disabled={!input.trim() || isStreaming}
                    onClick={() => void handleSend(input)}
                    type="button"
                  >
                    <ArrowUpRight className="size-4" />
                    Отправить
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="ring-1 ring-border/80 bg-card">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">
              Стартовые вопросы
            </CardTitle>
            <CardDescription>
              Готовые формулировки, чтобы быстро раскачать разговор по
              материалам.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {starterPrompts.map((prompt) => (
              <Button
                key={prompt}
                className="h-auto w-full justify-start whitespace-normal rounded-2xl px-4 py-3 text-left"
                disabled={isStreaming}
                onClick={() => void handleSend(prompt)}
                type="button"
                variant="outline"
              >
                {prompt}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="ring-1 ring-border/80 bg-card">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Контекст</CardTitle>
            <CardDescription>
              На чем сейчас строится ответ и в каком режиме живет блокнот.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/40 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Контур
              </p>
              <p className="mt-2 font-semibold text-foreground">
                {getContourLabel(notebook?.contour)}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Источники
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {notebook?.sources.length ?? 0}
              </p>
            </div>
            {lastAssistantMessage &&
              lastAssistantMessage.sources.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Последние найденные фрагменты
                  </p>
                  {lastAssistantMessage.sources
                    .slice(0, 3)
                    .map((source, index) => (
                      <div
                        key={`${index}-${source.slice(0, 12)}`}
                        className="rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-6 text-muted-foreground"
                      >
                        {source}
                      </div>
                    ))}
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
