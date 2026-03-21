export type NotebookSource = {
  id: string;
  filename: string;
  chunks_count: number;
  created_at: string;
};

export type Notebook = {
  id: string;
  title: string;
  created_at: string;
  sources: NotebookSource[];
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

export type MindmapNode = {
  title: string;
  children: MindmapNode[];
};

export type PodcastResponse = {
  audio_url?: string;
  [key: string]: unknown;
};
