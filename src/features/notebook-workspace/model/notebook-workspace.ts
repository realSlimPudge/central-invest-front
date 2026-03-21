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
import type { NotebookModuleId } from "@/features/notebook-workspace/model/notebook-module-availability";

export type NotebookWorkspaceSection = {
  label: string;
  items: Array<{
    module: NotebookModuleId;
    to: string;
    label: string;
    description: string;
    icon: LucideIcon;
    exact?: boolean;
  }>;
};

export const notebookWorkspaceSections: NotebookWorkspaceSection[] = [
  {
    label: "Работа",
    items: [
      {
        module: "overview",
        to: "/notebooks/$id",
        label: "Обзор",
        description: "Быстрый срез по состоянию блокнота.",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        module: "sources",
        to: "/notebooks/$id/sources",
        label: "Источники",
        description: "Загрузка документов, таблиц, аудио.",
        icon: FolderOpen,
      },
      {
        module: "chat",
        to: "/notebooks/$id/chat",
        label: "Чат",
        description: "Диалог по содержимому блокнота.",
        icon: MessageSquareText,
      },
    ],
  },
  {
    label: "Артефакты",
    items: [
      {
        module: "summary",
        to: "/notebooks/$id/summary",
        label: "Саммари",
        description: "Краткая выжимка по текущему набору источников.",
        icon: BookOpenText,
      },
      {
        module: "mindmap",
        to: "/notebooks/$id/mindmap",
        label: "Майнд-карта",
        description: "Визуальная структура тем, подтем и смысловых веток.",
        icon: GitBranchPlus,
      },
      {
        module: "flashcards",
        to: "/notebooks/$id/flashcards",
        label: "Карточки",
        description: "Набор флэш-карточек для повторения и самопроверки.",
        icon: BrainCircuit,
      },
      {
        module: "podcast",
        to: "/notebooks/$id/podcast",
        label: "Подкаст",
        description: "Аудиоверсия и сценарий по материалам блокнота.",
        icon: AudioLines,
      },
    ],
  },
  {
    label: "Аналитика",
    items: [
      {
        module: "contract",
        to: "/notebooks/$id/contract",
        label: "Договор",
        description: "Извлечение сторон, условий, обязательств и рисков.",
        icon: ScrollText,
      },
      {
        module: "knowledge-graph",
        to: "/notebooks/$id/knowledge-graph",
        label: "Граф знаний",
        description: "Сущности и связи, выделенные из корпуса документов.",
        icon: Network,
      },
      {
        module: "timeline",
        to: "/notebooks/$id/timeline",
        label: "Таймлайн",
        description: "Хронология событий, дедлайнов и ключевых дат.",
        icon: TimerReset,
      },
      {
        module: "questions",
        to: "/notebooks/$id/questions",
        label: "Вопросы",
        description:
          "Список пробелов, рисков и тем для дополнительной проверки.",
        icon: Blocks,
      },
      {
        module: "presentation",
        to: "/notebooks/$id/presentation",
        label: "Презентация",
        description: "Структура слайдов и экспорт готовой презентации.",
        icon: Presentation,
      },
    ],
  },
];

export const contourOptions = [
  { value: "open", label: "Стандартный режим" },
  { value: "closed", label: "Закрытый режим" },
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
