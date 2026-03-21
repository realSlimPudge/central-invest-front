import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AudioLines,
  BookOpenText,
  BrainCircuit,
  FolderOpen,
  GitBranchPlus,
  LoaderCircle,
  MessageSquareText,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/entities/auth/lib/use-auth";
import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import { notebookOptions } from "@/entities/notebook/api/notebook.options";
import type {
  MindmapNode,
  NotebookChatMessage,
} from "@/entities/notebook/api/notebook.types";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Spinner } from "@/shared/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { AUDIO_BASE_URL, API_BASE_URL } from "@/shared/constants/api";
import { getAccessToken } from "@/shared/lib/access-token";
import { cn } from "@/shared/lib/utils";

type WorkspaceTab = "chat" | "summary" | "mindmap" | "flashcards" | "podcast";

type ChatUiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Notice = {
  tone: "success" | "error";
  text: string;
};

type FlashcardItem = {
  question: string;
  answer: string;
};

const summaryStyles = ["official", "simple", "concise"] as const;
const podcastTones = ["popular", "formal", "energetic"] as const;
const tabItems: Array<{
  value: WorkspaceTab;
  label: string;
  icon: typeof MessageSquareText;
}> = [
  { value: "chat", label: "Чат", icon: MessageSquareText },
  { value: "summary", label: "Саммари", icon: BookOpenText },
  { value: "mindmap", label: "Mindmap", icon: GitBranchPlus },
  { value: "flashcards", label: "Карточки", icon: BrainCircuit },
  { value: "podcast", label: "Подкаст", icon: AudioLines },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function extractSummaryText(payload: unknown) {
  if (typeof payload === "string") {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return "";
  }

  const record = payload as Record<string, unknown>;
  const keys = ["summary", "text", "content", "result", "answer"];

  for (const key of keys) {
    if (typeof record[key] === "string") {
      return record[key] as string;
    }
  }

  return JSON.stringify(payload, null, 2);
}

function normalizeFlashcards(value: unknown): FlashcardItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return { question: item, answer: "" };
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const question =
        record.question ?? record.front ?? record.term ?? record.title;
      const answer = record.answer ?? record.back ?? record.definition;

      if (typeof question !== "string") {
        return null;
      }

      return {
        question,
        answer: typeof answer === "string" ? answer : "",
      };
    })
    .filter((item): item is FlashcardItem => item !== null);
}

function extractFlashcards(payload: unknown): FlashcardItem[] {
  const direct = normalizeFlashcards(payload);
  if (direct.length > 0) {
    return direct;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const keys = ["flashcards", "cards", "items", "questions"];

  for (const key of keys) {
    const cards = normalizeFlashcards(record[key]);
    if (cards.length > 0) {
      return cards;
    }
  }

  return [];
}

function extractPodcastUrl(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const url = record.audio_url ?? record.url;

  if (typeof url !== "string" || url.length === 0) {
    return null;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${AUDIO_BASE_URL}${url}`;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function ArtifactPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-muted/35 px-6 py-10 text-center">
      <p className="text-lg font-semibold text-[var(--text-h)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function MindmapTree({ node }: { node: MindmapNode }) {
  return (
    <li className="relative pl-6">
      <span className="absolute left-0 top-3 h-px w-3 bg-border" />
      <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
        <p className="font-medium text-[var(--text-h)]">{node.title}</p>
      </div>
      {node.children.length > 0 && (
        <ul className="mt-4 space-y-3 border-l border-border/70 pl-4">
          {node.children.map((child, index) => (
            <MindmapTree key={`${child.title}-${index}`} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("chat");
  const [newNotebookTitle, setNewNotebookTitle] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatUiMessage[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);
  const [summaryStyle, setSummaryStyle] =
    useState<(typeof summaryStyles)[number]>("official");
  const [summaryResult, setSummaryResult] = useState<unknown>(null);
  const [mindmapResult, setMindmapResult] = useState<MindmapNode | null>(null);
  const [flashcardsCount, setFlashcardsCount] = useState(10);
  const [flashcardsResult, setFlashcardsResult] = useState<unknown>(null);
  const [podcastTone, setPodcastTone] =
    useState<(typeof podcastTones)[number]>("popular");
  const [podcastResult, setPodcastResult] = useState<unknown>(null);
  const [workspaceNotice, setWorkspaceNotice] = useState<Notice | null>(null);

  const notebooksQuery = useQuery(notebookOptions.list());
  const notebooks = useMemo(
    () => notebooksQuery.data ?? [],
    [notebooksQuery.data],
  );

  useEffect(() => {
    if (notebooks.length === 0) {
      setActiveNotebookId(null);
      return;
    }

    if (!activeNotebookId) {
      setActiveNotebookId(notebooks[0].id);
      return;
    }

    const exists = notebooks.some((item) => item.id === activeNotebookId);
    if (!exists) {
      setActiveNotebookId(notebooks[0].id);
    }
  }, [activeNotebookId, notebooks]);

  const activeNotebookQuery = useQuery({
    ...notebookOptions.detail(activeNotebookId ?? ""),
    enabled: Boolean(activeNotebookId),
  });

  const activeNotebook =
    activeNotebookQuery.data ??
    notebooks.find((item) => item.id === activeNotebookId) ??
    null;

  useEffect(() => {
    setChatMessages([]);
    setChatInput("");
    setChatError(null);
    setSummaryResult(null);
    setMindmapResult(null);
    setFlashcardsResult(null);
    setPodcastResult(null);
    setWorkspaceNotice(null);
  }, [activeNotebookId]);

  const createNotebookMutation = useMutation({
    ...notebookOptions.create(),
    onSuccess: async (notebook) => {
      setNewNotebookTitle("");
      setActiveNotebookId(notebook.id);
      setWorkspaceNotice({
        tone: "success",
        text: `Блокнот «${notebook.title}» создан и готов к наполнению.`,
      });
      await queryClient.invalidateQueries({ queryKey: notebookKeys.list() });
    },
    onError: (error) => {
      setWorkspaceNotice({
        tone: "error",
        text: getErrorMessage(error, "Не удалось создать блокнот"),
      });
    },
  });

  const uploadSourceMutation = useMutation({
    mutationFn: async ({
      notebookId,
      files,
    }: {
      notebookId: string;
      files: File[];
    }) => {
      for (const file of files) {
        await notebookApi.uploadSource(notebookId, file);
      }
    },
    onSuccess: async (_, variables) => {
      setWorkspaceNotice({
        tone: "success",
        text: `Файлы добавлены в блокнот. Загружено: ${variables.files.length}.`,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notebookKeys.list() }),
        queryClient.invalidateQueries({
          queryKey: notebookKeys.detail(variables.notebookId),
        }),
      ]);
    },
    onError: (error) => {
      setWorkspaceNotice({
        tone: "error",
        text: getErrorMessage(error, "Не удалось загрузить файлы"),
      });
    },
  });

  const removeSourceMutation = useMutation({
    ...notebookOptions.removeSource(),
    onSuccess: async (_, variables) => {
      setWorkspaceNotice({
        tone: "success",
        text: "Источник удален из блокнота.",
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notebookKeys.list() }),
        queryClient.invalidateQueries({
          queryKey: notebookKeys.detail(variables.notebookId),
        }),
      ]);
    },
    onError: (error) => {
      setWorkspaceNotice({
        tone: "error",
        text: getErrorMessage(error, "Не удалось удалить источник"),
      });
    },
  });

  const summaryMutation = useMutation({
    mutationKey: notebookKeys.summary(),
    mutationFn: ({
      notebookId,
      style,
    }: {
      notebookId: string;
      style: string;
    }) => notebookApi.summary(notebookId, { style }),
    onSuccess: (data) => {
      setSummaryResult(data);
      setWorkspaceNotice({
        tone: "success",
        text: "Саммари готово. Проверь результат и при необходимости перегенерируй.",
      });
    },
    onError: (error) => {
      setWorkspaceNotice({
        tone: "error",
        text: getErrorMessage(error, "Не удалось создать саммари"),
      });
    },
  });

  const mindmapMutation = useMutation({
    mutationKey: notebookKeys.mindmap(),
    mutationFn: (notebookId: string) => notebookApi.mindmap(notebookId),
    onSuccess: (data) => {
      setMindmapResult(data);
      setWorkspaceNotice({
        tone: "success",
        text: "Mindmap построена. Можно исследовать структуру по веткам.",
      });
    },
    onError: (error) => {
      setWorkspaceNotice({
        tone: "error",
        text: getErrorMessage(error, "Не удалось построить mindmap"),
      });
    },
  });

  const flashcardsMutation = useMutation({
    mutationKey: notebookKeys.flashcards(),
    mutationFn: ({
      notebookId,
      count,
    }: {
      notebookId: string;
      count: number;
    }) => notebookApi.flashcards(notebookId, { count }),
    onSuccess: (data) => {
      setFlashcardsResult(data);
      setWorkspaceNotice({
        tone: "success",
        text: "Карточки сгенерированы. Можно повторить материал прямо в интерфейсе.",
      });
    },
    onError: (error) => {
      setWorkspaceNotice({
        tone: "error",
        text: getErrorMessage(error, "Не удалось создать карточки"),
      });
    },
  });

  const podcastMutation = useMutation({
    mutationKey: notebookKeys.podcast(),
    mutationFn: ({ notebookId, tone }: { notebookId: string; tone: string }) =>
      notebookApi.podcast(notebookId, { tone }),
    onSuccess: (data) => {
      setPodcastResult(data);
      setWorkspaceNotice({
        tone: "success",
        text: "Подкаст готов. Можно запускать воспроизведение прямо на странице.",
      });
    },
    onError: (error) => {
      setWorkspaceNotice({
        tone: "error",
        text: getErrorMessage(error, "Не удалось сгенерировать подкаст"),
      });
    },
  });

  const notebookStats = useMemo(() => {
    if (!activeNotebook) {
      return { sources: 0, chunks: 0 };
    }

    const chunks = activeNotebook.sources.reduce(
      (total, source) => total + source.chunks_count,
      0,
    );

    return { sources: activeNotebook.sources.length, chunks };
  }, [activeNotebook]);

  const flashcards = useMemo(
    () => extractFlashcards(flashcardsResult),
    [flashcardsResult],
  );
  const summaryText = useMemo(
    () => extractSummaryText(summaryResult),
    [summaryResult],
  );
  const podcastUrl = useMemo(
    () => extractPodcastUrl(podcastResult),
    [podcastResult],
  );

  const hasSources = (activeNotebook?.sources.length ?? 0) > 0;
  const handleCreateNotebook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = newNotebookTitle.trim();
    if (!title) {
      setWorkspaceNotice({
        tone: "error",
        text: "Укажи название блокнота перед созданием.",
      });
      return;
    }

    await createNotebookMutation.mutateAsync({ title });
  };

  const handleFilesSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (!activeNotebookId || files.length === 0) {
      return;
    }

    await uploadSourceMutation.mutateAsync({
      notebookId: activeNotebookId,
      files,
    });
    event.target.value = "";
  };

  const handleSendChat = async () => {
    if (!activeNotebookId) {
      return;
    }

    const query = chatInput.trim();
    if (!query) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setChatError("Сессия не найдена. Перезайди в систему.");
      return;
    }

    const userMessage: ChatUiMessage = {
      id: makeId(),
      role: "user",
      content: query,
    };
    const assistantMessage: ChatUiMessage = {
      id: makeId(),
      role: "assistant",
      content: "",
    };

    const history: NotebookChatMessage[] = [...chatMessages, userMessage].map(
      (message) => ({ role: message.role, content: message.content }),
    );

    setChatInput("");
    setChatError(null);
    setChatMessages((prev) => [...prev, userMessage, assistantMessage]);

    try {
      const response = await fetch(
        `${API_BASE_URL}/notebooks/${activeNotebookId}/chat`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, history }),
        },
      );

      if (!response.ok) {
        throw new Error(`Чат вернул ошибку ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Сервер не вернул поток ответа");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) {
            continue;
          }

          const raw = trimmed.slice(6);
          if (raw === "[DONE]") {
            continue;
          }

          const payload = JSON.parse(raw) as { delta?: string };
          const delta = payload.delta ?? "";

          if (!delta) {
            continue;
          }

          setChatMessages((prev) =>
            prev.map((message) =>
              message.id === assistantMessage.id
                ? { ...message, content: `${message.content}${delta}` }
                : message,
            ),
          );
        }
      }
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Не удалось получить ответ из чата",
      );
      setChatError(message);
      setWorkspaceNotice({ tone: "error", text: message });
      setChatMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessage.id
            ? {
                ...message,
                content:
                  message.content || "Не удалось получить ответ от модели.",
              }
            : message,
        ),
      );
    }
  };

  const isChatLoading =
    chatMessages.length > 0 &&
    chatMessages[chatMessages.length - 1]?.role === "assistant" &&
    chatMessages[chatMessages.length - 1]?.content.length === 0;

  return (
    <section className="min-h-screen bg-background px-4 py-4 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1540px] gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Card className="overflow-hidden border-none bg-[radial-gradient(circle_at_top,var(--accent),transparent_58%)] ring-1 ring-border/80">
            <CardHeader>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" />
                Рабочее пространство Notebook
              </div>
              <CardTitle className="text-2xl font-semibold text-[var(--text-h)]">
                Central AI
              </CardTitle>
              <CardDescription className="leading-6">
                Один блокнот для документов, ответов, саммари, mindmap и аудио.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border bg-card/80 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Авторизован как
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--text-h)]">
                  {user?.username ?? "Пользователь"}
                </p>
              </div>

              <form className="space-y-3" onSubmit={handleCreateNotebook}>
                <Input
                  value={newNotebookTitle}
                  onChange={(event) => setNewNotebookTitle(event.target.value)}
                  placeholder="Название нового блокнота"
                />
                <Button
                  className="w-full"
                  disabled={createNotebookMutation.isPending}
                >
                  {createNotebookMutation.isPending ? (
                    <Spinner />
                  ) : (
                    <>
                      <Plus className="size-4" />
                      Создать блокнот
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="ring-1 ring-border/80">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--text-h)]">
                Мои блокноты
              </CardTitle>
              <CardDescription>
                Выбери существующий блокнот или создай новый для загрузки
                материалов.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notebooksQuery.isPending ? (
                <div className="space-y-3">
                  <Skeleton className="h-18 w-full rounded-2xl" />
                  <Skeleton className="h-18 w-full rounded-2xl" />
                  <Skeleton className="h-18 w-full rounded-2xl" />
                </div>
              ) : notebooks.length === 0 ? (
                <ArtifactPlaceholder
                  title="Пока нет блокнотов"
                  description="Создай первый блокнот, чтобы начать загрузку файлов и работу с AI-инструментами."
                />
              ) : (
                <div className="space-y-3">
                  {notebooks.map((notebook) => {
                    const isActive = notebook.id === activeNotebookId;
                    return (
                      <button
                        key={notebook.id}
                        className={cn(
                          "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
                          isActive
                            ? "border-primary/40 bg-primary/8"
                            : "border-border bg-card hover:bg-muted/40",
                        )}
                        onClick={() => setActiveNotebookId(notebook.id)}
                        type="button"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[var(--text-h)]">
                              {notebook.title}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDate(notebook.created_at)}
                            </p>
                          </div>
                          <div className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                            {notebook.sources.length}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <main className="space-y-6">
            <Card className="border-none bg-[linear-gradient(180deg,var(--card),color-mix(in_oklab,var(--accent)_55%,var(--card)))] ring-1 ring-border/80">
              <CardHeader className="gap-4 lg:flex lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                    <FolderOpen className="size-3.5 text-primary" />
                    Активный блокнот
                  </div>
                  <CardTitle className="mt-4 text-3xl font-semibold tracking-tight text-[var(--text-h)]">
                    {activeNotebook?.title ?? "Выбери блокнот"}
                  </CardTitle>
                  <CardDescription className="mt-2 max-w-2xl leading-6">
                    {activeNotebook
                      ? "Загружай документы, общайся с материалом и создавай производные артефакты внутри одного рабочего контура."
                      : "Сначала выбери блокнот слева или создай новый, чтобы открыть рабочую область."}
                  </CardDescription>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-card px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Источники
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--text-h)]">
                      {notebookStats.sources}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Чанки
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--text-h)]">
                      {notebookStats.chunks}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Обновление
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--text-h)]">
                      {activeNotebook
                        ? formatDate(activeNotebook.created_at)
                        : "—"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {workspaceNotice ? (
                  <div
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-sm leading-6",
                      workspaceNotice.tone === "success"
                        ? "border-primary/30 bg-primary/8 text-foreground"
                        : "border-destructive/30 bg-destructive/10 text-destructive",
                    )}
                  >
                    {workspaceNotice.text}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                    Все рабочие режимы используют данные из одного блокнота и
                    его загруженных источников.
                  </div>
                )}

                <Button
                  variant="outline"
                  className="min-w-40"
                  onClick={() => {
                    void notebooksQuery.refetch();
                    if (activeNotebookId) {
                      void activeNotebookQuery.refetch();
                    }
                  }}
                  type="button"
                >
                  <RefreshCw className="size-4" />
                  Обновить данные
                </Button>
              </CardContent>
            </Card>

            <Card className="ring-1 ring-border/80">
              <CardHeader>
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value as WorkspaceTab)}
                  className="gap-4"
                >
                  <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-muted p-2 md:grid-cols-5">
                    {tabItems.map(({ value, label, icon: Icon }) => (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className="h-10 rounded-xl font-medium"
                      >
                        <Icon className="size-4" />
                        {label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                {!activeNotebook ? (
                  <ArtifactPlaceholder
                    title="Рабочая область появится после выбора блокнота"
                    description="Как только выберешь блокнот, здесь откроются чат, генерация саммари, mindmap, карточек и подкаста."
                  />
                ) : activeTab === "chat" ? (
                  <div className="space-y-5">
                    <div className="rounded-3xl border border-border bg-muted/25 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold text-[var(--text-h)]">
                            Чат по источникам
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Ответ приходит стримом по SSE, поэтому текст
                            появляется постепенно.
                          </p>
                        </div>
                        {!hasSources && (
                          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                            Нужны документы
                          </span>
                        )}
                      </div>

                      <div className="min-h-[360px] space-y-3 rounded-3xl border border-border bg-card px-4 py-4">
                        {chatMessages.length === 0 ? (
                          <ArtifactPlaceholder
                            title="Чат пока пуст"
                            description="Задай первый вопрос по загруженным материалам. История сообщений автоматически уходит в backend как history."
                          />
                        ) : (
                          chatMessages.map((message) => (
                            <div
                              key={message.id}
                              className={cn(
                                "max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-7",
                                message.role === "user"
                                  ? "ml-auto bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground",
                              )}
                            >
                              {message.content || (
                                <span className="inline-flex items-center gap-2 text-muted-foreground">
                                  <LoaderCircle className="size-4 animate-spin" />
                                  Генерируется ответ...
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {chatError && (
                        <p className="mt-3 text-sm text-destructive">
                          {chatError}
                        </p>
                      )}

                      <div className="mt-4 flex flex-col gap-3 lg:flex-row">
                        <textarea
                          className="min-h-28 flex-1 rounded-3xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
                          onChange={(event) => setChatInput(event.target.value)}
                          placeholder="Например: какие ключевые выводы есть в загруженных документах?"
                          value={chatInput}
                        />
                        <Button
                          className="h-auto min-h-28 min-w-40 rounded-3xl"
                          disabled={
                            !hasSources ||
                            isChatLoading ||
                            chatInput.trim().length === 0
                          }
                          onClick={() => void handleSendChat()}
                          type="button"
                        >
                          {isChatLoading ? <Spinner /> : "Отправить вопрос"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : activeTab === "summary" ? (
                  <div className="space-y-5">
                    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-muted/25 p-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-[var(--text-h)]">
                          Саммари по блокноту
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Генерация идет через `POST /notebooks/{"{id}"}
                          /summary` с параметром стиля.
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <select
                          className="h-11 rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none"
                          onChange={(event) =>
                            setSummaryStyle(
                              event.target
                                .value as (typeof summaryStyles)[number],
                            )
                          }
                          value={summaryStyle}
                        >
                          {summaryStyles.map((style) => (
                            <option key={style} value={style}>
                              {style}
                            </option>
                          ))}
                        </select>
                        <Button
                          disabled={!hasSources || summaryMutation.isPending}
                          onClick={() =>
                            activeNotebookId &&
                            void summaryMutation.mutateAsync({
                              notebookId: activeNotebookId,
                              style: summaryStyle,
                            })
                          }
                          type="button"
                        >
                          {summaryMutation.isPending ? (
                            <Spinner />
                          ) : (
                            "Сгенерировать саммари"
                          )}
                        </Button>
                      </div>
                    </div>

                    {summaryResult ? (
                      <div className="rounded-3xl border border-border bg-card px-6 py-5">
                        <p className="mb-4 text-sm font-medium text-muted-foreground">
                          Результат
                        </p>
                        <div className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                          {summaryText}
                        </div>
                      </div>
                    ) : (
                      <ArtifactPlaceholder
                        title="Саммари пока не создано"
                        description="Выбери стиль, запусти генерацию и получи сводный текст по всем загруженным источникам."
                      />
                    )}
                  </div>
                ) : activeTab === "mindmap" ? (
                  <div className="space-y-5">
                    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-muted/25 p-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-[var(--text-h)]">
                          Mindmap по документам
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Ветка строится рекурсивно из `title` и `children`.
                        </p>
                      </div>
                      <Button
                        disabled={!hasSources || mindmapMutation.isPending}
                        onClick={() =>
                          activeNotebookId &&
                          void mindmapMutation.mutateAsync(activeNotebookId)
                        }
                        type="button"
                      >
                        {mindmapMutation.isPending ? (
                          <Spinner />
                        ) : (
                          "Построить mindmap"
                        )}
                      </Button>
                    </div>

                    {mindmapResult ? (
                      <div className="rounded-3xl border border-border bg-card px-6 py-5">
                        <ul className="space-y-4">
                          <MindmapTree node={mindmapResult} />
                        </ul>
                      </div>
                    ) : (
                      <ArtifactPlaceholder
                        title="Mindmap пока не построена"
                        description="После генерации здесь появится иерархия тем и подтем по содержимому блокнота."
                      />
                    )}
                  </div>
                ) : activeTab === "flashcards" ? (
                  <div className="space-y-5">
                    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-muted/25 p-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-[var(--text-h)]">
                          Флэш-карточки
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Быстрый режим активного повторения по ключевым фактам
                          и понятиям.
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Input
                          className="w-28"
                          max={50}
                          min={1}
                          onChange={(event) =>
                            setFlashcardsCount(Number(event.target.value) || 1)
                          }
                          type="number"
                          value={flashcardsCount}
                        />
                        <Button
                          disabled={!hasSources || flashcardsMutation.isPending}
                          onClick={() =>
                            activeNotebookId &&
                            void flashcardsMutation.mutateAsync({
                              notebookId: activeNotebookId,
                              count: flashcardsCount,
                            })
                          }
                          type="button"
                        >
                          {flashcardsMutation.isPending ? (
                            <Spinner />
                          ) : (
                            "Сгенерировать карточки"
                          )}
                        </Button>
                      </div>
                    </div>

                    {flashcards.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {flashcards.map((card, index) => (
                          <div
                            key={`${card.question}-${index}`}
                            className="rounded-3xl border border-border bg-card px-5 py-5"
                          >
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              Карточка {index + 1}
                            </p>
                            <p className="mt-4 text-lg font-semibold text-[var(--text-h)]">
                              {card.question}
                            </p>
                            <Separator className="my-4" />
                            <p className="text-sm leading-7 text-muted-foreground">
                              {card.answer ||
                                "Ответ не был явно указан в payload, но карточка создана."}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : flashcardsResult ? (
                      <div className="rounded-3xl border border-border bg-card px-6 py-5">
                        <pre className="overflow-x-auto text-sm leading-6 text-muted-foreground">
                          {JSON.stringify(flashcardsResult, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <ArtifactPlaceholder
                        title="Карточки пока не созданы"
                        description="Укажи количество и запусти генерацию, чтобы получить набор для самопроверки."
                      />
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-muted/25 p-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-[var(--text-h)]">
                          Аудиоподкаст по материалам
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Генерация занимает до пары минут, затем можно сразу
                          воспроизвести результат.
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <select
                          className="h-11 rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none"
                          onChange={(event) =>
                            setPodcastTone(
                              event.target
                                .value as (typeof podcastTones)[number],
                            )
                          }
                          value={podcastTone}
                        >
                          {podcastTones.map((tone) => (
                            <option key={tone} value={tone}>
                              {tone}
                            </option>
                          ))}
                        </select>
                        <Button
                          disabled={!hasSources || podcastMutation.isPending}
                          onClick={() =>
                            activeNotebookId &&
                            void podcastMutation.mutateAsync({
                              notebookId: activeNotebookId,
                              tone: podcastTone,
                            })
                          }
                          type="button"
                        >
                          {podcastMutation.isPending ? (
                            <Spinner />
                          ) : (
                            "Сгенерировать подкаст"
                          )}
                        </Button>
                      </div>
                    </div>

                    {podcastUrl ? (
                      <div className="rounded-3xl border border-border bg-card px-6 py-5">
                        <p className="text-sm font-medium text-muted-foreground">
                          Готовый аудиофайл
                        </p>
                        <audio
                          className="mt-4 w-full"
                          controls
                          src={podcastUrl}
                        />
                        <p className="mt-4 break-all text-xs text-muted-foreground">
                          {podcastUrl}
                        </p>
                      </div>
                    ) : podcastResult ? (
                      <div className="rounded-3xl border border-border bg-card px-6 py-5">
                        <pre className="overflow-x-auto text-sm leading-6 text-muted-foreground">
                          {JSON.stringify(podcastResult, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <ArtifactPlaceholder
                        title="Подкаст пока не создан"
                        description="Выбери тон и запусти генерацию. После ответа API здесь появится встроенный плеер."
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>

          <aside className="space-y-6">
            <Card className="ring-1 ring-border/80">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[var(--text-h)]">
                  Источники
                </CardTitle>
                <CardDescription>
                  Добавляй материалы в блокнот, чтобы открыть чат и генерацию
                  всех артефактов.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/35 px-5 py-8 text-center transition-colors",
                    !activeNotebook && "cursor-not-allowed opacity-60",
                  )}
                >
                  <Upload className="size-8 text-primary" />
                  <p className="mt-4 text-sm font-semibold text-[var(--text-h)]">
                    Загрузить документы
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    PDF, DOCX, TXT, MD и другие материалы, которые система может
                    обработать.
                  </p>
                  <input
                    className="hidden"
                    disabled={!activeNotebook || uploadSourceMutation.isPending}
                    multiple
                    onChange={(event) => void handleFilesSelected(event)}
                    type="file"
                  />
                </label>

                {activeNotebookQuery.isPending && activeNotebookId ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full rounded-2xl" />
                    <Skeleton className="h-16 w-full rounded-2xl" />
                  </div>
                ) : activeNotebook?.sources.length ? (
                  <div className="space-y-3">
                    {activeNotebook.sources.map((source) => (
                      <div
                        key={source.id}
                        className="rounded-2xl border border-border bg-card px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[var(--text-h)]">
                              {source.filename}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {source.chunks_count} чанков •{" "}
                              {formatDate(source.created_at)}
                            </p>
                          </div>
                          <Button
                            className="size-8 rounded-full"
                            disabled={
                              removeSourceMutation.isPending ||
                              !activeNotebookId
                            }
                            onClick={() =>
                              activeNotebookId &&
                              void removeSourceMutation.mutateAsync({
                                notebookId: activeNotebookId,
                                sourceId: source.id,
                              })
                            }
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <Trash2 className="size-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ArtifactPlaceholder
                    title="Источники пока не загружены"
                    description="Добавь хотя бы один документ, чтобы открыть чат и генерацию артефактов."
                  />
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </section>
  );
}
