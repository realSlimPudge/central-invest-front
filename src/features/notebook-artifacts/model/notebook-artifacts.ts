import {
  AudioLines,
  BookOpenText,
  BrainCircuit,
  GitBranchPlus,
  type LucideIcon,
} from "lucide-react";

export type NotebookTab = "summary" | "mindmap" | "flashcards" | "podcast";

export type SummaryStyle = "official" | "popular";

export type PodcastTone = "popular" | "scientific";

type NotebookTabItem = {
  value: NotebookTab;
  label: string;
  icon: LucideIcon;
};

type SelectOption<T extends string> = {
  value: T;
  label: string;
};

export const SUMMARY_STYLE_OPTIONS: SelectOption<SummaryStyle>[] = [
  { value: "official", label: "Официальный" },
  { value: "popular", label: "Простым языком" },
];

export const PODCAST_TONE_OPTIONS: SelectOption<PodcastTone>[] = [
  { value: "popular", label: "Популярный" },
  { value: "scientific", label: "Научный" },
];

export const NOTEBOOK_TAB_ITEMS: NotebookTabItem[] = [
  { value: "summary", label: "Саммари", icon: BookOpenText },
  { value: "mindmap", label: "Майнд-карта", icon: GitBranchPlus },
  { value: "flashcards", label: "Карточки", icon: BrainCircuit },
  { value: "podcast", label: "Подкаст", icon: AudioLines },
];
