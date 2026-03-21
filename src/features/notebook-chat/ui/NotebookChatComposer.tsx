import { ArrowUpRight, StopCircle } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  ChatComposer,
  ChatComposerActions,
  ChatComposerFooter,
  ChatComposerHint,
  ChatComposerTextarea,
} from "@/shared/components/ui/chat";

type NotebookChatComposerProps = {
  input: string;
  isStreaming: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
};

export function NotebookChatComposer({
  input,
  isStreaming,
  onInputChange,
  onSend,
  onStop,
}: NotebookChatComposerProps) {
  return (
    <ChatComposer>
      <ChatComposerTextarea
        disabled={isStreaming}
        className="px-3 pt-1"
        onChange={(event) => onInputChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
          }
        }}
        placeholder="Например: какие обязательства и риски встречаются в этих документах?"
        value={input}
      />
      <ChatComposerFooter>
        <ChatComposerHint>
          `Enter` — отправить, `Shift + Enter` — новая строка.
        </ChatComposerHint>
        <ChatComposerActions>
          {isStreaming ? (
            <Button onClick={onStop} type="button" variant="outline">
              <StopCircle className="size-4" />
              Остановить
            </Button>
          ) : null}
          <Button
            disabled={!input.trim() || isStreaming}
            onClick={onSend}
            type="button"
          >
            <ArrowUpRight className="size-4" />
            Отправить
          </Button>
        </ChatComposerActions>
      </ChatComposerFooter>
    </ChatComposer>
  );
}
