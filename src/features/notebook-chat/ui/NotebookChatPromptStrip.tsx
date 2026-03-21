import { ChatSuggestion, ChatSuggestions } from "@/shared/components/ui/chat";

type NotebookChatPromptStripProps = {
  prompts: string[];
  isStreaming: boolean;
  onSelectPrompt: (prompt: string) => void;
};

export function NotebookChatPromptStrip({
  prompts,
  isStreaming,
  onSelectPrompt,
}: NotebookChatPromptStripProps) {
  return (
    <div className="-mx-1 overflow-x-auto pb-1">
      <ChatSuggestions className="w-max min-w-full flex-nowrap px-1">
        {prompts.map((prompt) => (
          <ChatSuggestion
            key={prompt}
            className="max-w-[22rem] shrink-0"
            disabled={isStreaming}
            onClick={() => onSelectPrompt(prompt)}
          >
            {prompt}
          </ChatSuggestion>
        ))}
      </ChatSuggestions>
    </div>
  );
}
