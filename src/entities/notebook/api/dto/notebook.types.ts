export type NotebookSource = {
  id: string;
  filename: string;
  chunks_count: number;
  created_at: string;
};

export type MindmapNode = {
  title: string;
  children: MindmapNode[];
};

export type NotebookFlashcard =
  | string
  | {
      question?: string;
      answer?: string;
      front?: string;
      back?: string;
      term?: string;
      definition?: string;
      [key: string]: unknown;
    };

export type PodcastScriptLine =
  | string
  | {
      speaker?: string;
      text?: string;
      content?: string;
      [key: string]: unknown;
    };

export type Notebook = {
  id: string;
  title: string;
  created_at: string;
  sources: NotebookSource[];
  summary?: string | null;
  mindmap?: MindmapNode | Record<string, unknown> | null;
  flashcards?: NotebookFlashcard[] | null;
  podcast_url?: string | null;
  podcast_script?: PodcastScriptLine[] | null;
};

export type CreateNotebookBody = {
  title: string;
};

export type UpdateNotebookBody = {
  title: string;
};

export type NotebookChatMessage = {
  role: string;
  content: string;
};

export type NotebookChatBody = {
  query: string;
  history?: NotebookChatMessage[];
};

export type NotebookSummaryBody = {
  style?: string;
};

export type NotebookFlashcardsBody = {
  count?: number;
};

export type NotebookPodcastBody = {
  tone?: string;
};

export type PodcastResponse = {
  audio_url?: string;
  [key: string]: unknown;
};
