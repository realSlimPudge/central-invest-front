import {
  AudioLines,
  Blocks,
  BookOpenText,
  BrainCircuit,
  FolderOpen,
  GitBranchPlus,
  LayoutDashboard,
  MessageSquareText,
  Network,
  Presentation,
  ScrollText,
  TimerReset,
  type LucideIcon,
} from "lucide-react";

export type NotebookWorkspaceSection = {
  label: string;
  items: Array<{
    to: string;
    label: string;
    icon: LucideIcon;
    exact?: boolean;
  }>;
};

export const notebookWorkspaceSections: NotebookWorkspaceSection[] = [
  {
    label: "Работа",
    items: [
      {
        to: "/notebooks/$id",
        label: "Обзор",
        icon: LayoutDashboard,
        exact: true,
      },
      { to: "/notebooks/$id/sources", label: "Источники", icon: FolderOpen },
      { to: "/notebooks/$id/chat", label: "Чат", icon: MessageSquareText },
    ],
  },
  {
    label: "Артефакты",
    items: [
      { to: "/notebooks/$id/summary", label: "Саммари", icon: BookOpenText },
      {
        to: "/notebooks/$id/mindmap",
        label: "Майнд-карта",
        icon: GitBranchPlus,
      },
      {
        to: "/notebooks/$id/flashcards",
        label: "Карточки",
        icon: BrainCircuit,
      },
      { to: "/notebooks/$id/podcast", label: "Подкаст", icon: AudioLines },
    ],
  },
  {
    label: "Аналитика",
    items: [
      { to: "/notebooks/$id/contract", label: "Договор", icon: ScrollText },
      {
        to: "/notebooks/$id/knowledge-graph",
        label: "Граф знаний",
        icon: Network,
      },
      { to: "/notebooks/$id/timeline", label: "Таймлайн", icon: TimerReset },
      { to: "/notebooks/$id/questions", label: "Вопросы", icon: Blocks },
      {
        to: "/notebooks/$id/presentation",
        label: "Презентация",
        icon: Presentation,
      },
    ],
  },
];

export const contourOptions = [
  { value: "open", label: "Открытый контур" },
  { value: "closed", label: "Закрытый контур" },
] as const;

export const questionContextOptions = [
  { value: "general", label: "Общий анализ" },
  { value: "credit", label: "Кредитный аналитик" },
  { value: "legal", label: "Юрист" },
  { value: "financial", label: "Финансовый аналитик" },
] as const;

export const presentationStyleOptions = [
  { value: "business", label: "Деловой" },
  { value: "academic", label: "Академический" },
  { value: "popular", label: "Популярный" },
] as const;

export const summaryStyleOptions = [
  { value: "official", label: "Официальный" },
  { value: "popular", label: "Простым языком" },
] as const;
