import { ChatSuggestion, ChatSuggestions } from "@/shared/components/ui/chat";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

type NotebookChatSidebarProps = {
  starterPrompts: string[];
  isStreaming: boolean;
  onSelectPrompt: (prompt: string) => void;
  contourLabel: string;
  sourcesCount: number;
};

export function NotebookChatSidebar({
  starterPrompts,
  isStreaming,
  onSelectPrompt,
  contourLabel,
  sourcesCount,
}: NotebookChatSidebarProps) {
  return (
    <div className="space-y-6">
      <Card className="ring-1 ring-border/80 bg-card">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Стартовые вопросы
          </CardTitle>
          <CardDescription>
            Готовые формулировки, чтобы быстро начать разговор по материалам.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChatSuggestions className="flex-col">
            {starterPrompts.map((prompt) => (
              <ChatSuggestion
                key={prompt}
                className="w-full"
                disabled={isStreaming}
                onClick={() => onSelectPrompt(prompt)}
              >
                {prompt}
              </ChatSuggestion>
            ))}
          </ChatSuggestions>
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
              Режим
            </p>
            <p className="mt-2 font-semibold text-foreground">{contourLabel}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Источники
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {sourcesCount}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
