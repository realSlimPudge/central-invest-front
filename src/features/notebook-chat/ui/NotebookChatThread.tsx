import type { RefObject } from "react";

import ReactMarkdown from "react-markdown";
import { Bot, ChevronDown, User } from "lucide-react";

import type { ChatMessage } from "@/features/notebook-chat/model/chat-history";
import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import { summaryMarkdownComponents } from "@/features/notebook-summary/config/markdonw";
import { Button } from "@/shared/components/ui/button";
import {
  ChatMessage as ChatMessageBubble,
  ChatMessageAuthor,
  ChatMessageAvatar,
  ChatMessageBody,
  ChatMessageHeader,
  ChatMessageList,
  ChatViewport,
} from "@/shared/components/ui/chat";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";

function MessageSources({
  messageId,
  sources,
}: {
  messageId: string;
  sources: string[];
}) {
  return (
    <Collapsible className="mt-4" defaultOpen={false}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Опора на источники
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Найдено фрагментов: {sources.length}
          </p>
        </div>

        <CollapsibleTrigger asChild>
          <Button
            className="group h-8 self-start rounded-full px-3 text-xs"
            size="sm"
            type="button"
            variant="ghost"
          >
            Показать
            <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="mt-3 space-y-2">
        {sources.slice(0, 3).map((source, index) => (
          <div
            key={`${messageId}-${index}`}
            className="rounded-2xl border border-border bg-card px-3 py-3 text-sm leading-6 text-muted-foreground"
          >
            {source}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

type NotebookChatThreadProps = {
  messages: ChatMessage[];
  isStreaming: boolean;
  isHistoryPending: boolean;
  threadEndRef: RefObject<HTMLDivElement | null>;
};

export function NotebookChatThread({
  messages,
  isStreaming,
  isHistoryPending,
  threadEndRef,
}: NotebookChatThreadProps) {
  return (
    <ChatViewport>
      {messages.length > 0 ? (
        <ChatMessageList>
          {messages.map((message) => (
            <ChatMessageBubble
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-auto w-fit max-w-[88%] border-transparent bg-transparent px-0 py-0 shadow-none sm:max-w-3xl"
                  : undefined
              }
              role={message.role}
            >
              <ChatMessageHeader
                className={message.role === "user" ? "justify-end" : undefined}
              >
                <ChatMessageAvatar role={message.role}>
                  {message.role === "user" ? (
                    <User className="size-4" />
                  ) : (
                    <Bot className="size-4" />
                  )}
                </ChatMessageAvatar>
                <ChatMessageAuthor>
                  {message.role === "user" ? "Ты" : "Ассистент"}
                </ChatMessageAuthor>
              </ChatMessageHeader>

              {message.role === "assistant" ? (
                <ChatMessageBody className="space-y-3">
                  {message.content ? (
                    <ReactMarkdown components={summaryMarkdownComponents}>
                      {message.content}
                    </ReactMarkdown>
                  ) : isStreaming ? (
                    <div className="text-sm leading-7 text-foreground">
                      Собираю ответ...
                    </div>
                  ) : null}
                </ChatMessageBody>
              ) : (
                <ChatMessageBody className="whitespace-pre-wrap text-right">
                  {message.content}
                </ChatMessageBody>
              )}

              {message.role === "assistant" && message.sources.length > 0 ? (
                <MessageSources
                  messageId={message.id}
                  sources={message.sources}
                />
              ) : null}
            </ChatMessageBubble>
          ))}
        </ChatMessageList>
      ) : isHistoryPending ? (
        <div className="rounded-3xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground sm:px-6 sm:py-10">
          Загружаю историю диалога...
        </div>
      ) : (
        <ArtifactPlaceholder
          description="Начни с одного вопроса по документам — например про риски, сроки, расхождения или ключевые тезисы."
          title="Чат пока пустой"
        />
      )}
      <div ref={threadEndRef} />
    </ChatViewport>
  );
}
