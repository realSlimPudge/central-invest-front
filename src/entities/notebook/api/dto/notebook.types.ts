export type MeRes = {
  id: string;
  title: string;
  created_at: string;
}[];
export type NotebookSource = {
  id: string;
  filename: string;
  chunks_count: number;
  created_at: string;
  status?: string;
  error?: string | null;
  doc_type?: string | null;
  tags?: string[];
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

export type NotebookContour = "open" | "closed" | string;

export type NotebookContract = {
  parties?: string[];
  subject?: string;
  key_conditions?: string[];
  obligations?: Array<{
    party?: string;
    text?: string;
    [key: string]: unknown;
  }>;
  risks?: string[];
  deadlines?: string[];
  penalties?: string[];
  [key: string]: unknown;
};

export type NotebookGraphNode = {
  id: string;
  label: string;
  type?: string;
  [key: string]: unknown;
};

export type NotebookGraphEdge = {
  source: string;
  target: string;
  label?: string;
  [key: string]: unknown;
};

export type NotebookKnowledgeGraph = {
  nodes?: NotebookGraphNode[];
  edges?: NotebookGraphEdge[];
  [key: string]: unknown;
};

export type NotebookTimelineEvent = {
  date: string;
  title: string;
  description?: string;
  type?: string;
  [key: string]: unknown;
};

export type NotebookTimeline = {
  events?: NotebookTimelineEvent[];
  [key: string]: unknown;
};

export type NotebookQuestionItem = {
  question: string;
  category?: string;
  priority?: string;
  [key: string]: unknown;
};

export type NotebookQuestions = {
  questions?: NotebookQuestionItem[];
  summary?: string;
  [key: string]: unknown;
};

export type NotebookPresentationSlide = {
  type?: string;
  title?: string;
  subtitle?: string;
  bullets?: string[];
  [key: string]: unknown;
};

export type NotebookPresentation = {
  slides?: NotebookPresentationSlide[];
  [key: string]: unknown;
};

export type Notebook = {
  id: string;
  title: string;
  created_at: string;
  contour?: NotebookContour;
  doc_type?: string | null;
  tags?: string[];
  sources: NotebookSource[];
  summary?: string | null;
  mindmap?: MindmapNode | Record<string, unknown> | null;
  flashcards?: NotebookFlashcard[] | null;
  podcast_url?: string | null;
  podcast_script?: PodcastScriptLine[] | null;
  contract?: NotebookContract | Record<string, unknown> | null;
  knowledge_graph?: NotebookKnowledgeGraph | Record<string, unknown> | null;
  timeline?: NotebookTimeline | Record<string, unknown> | null;
  questions?: NotebookQuestions | Record<string, unknown> | null;
  presentation?: NotebookPresentation | Record<string, unknown> | null;
};

export type CreateNotebookBody = {
  title: string;
  contour?: NotebookContour;
};

export type UpdateNotebookBody = {
  title: string;
};

export type NotebookChatMessage = {
  role: string;
  content: string;
};

export type NotebookChatSource =
  | string
  | {
      text?: string;
      content?: string;
      quote?: string;
      chunk?: string;
      source?: string;
      filename?: string;
      [key: string]: unknown;
    };

export type NotebookChatHistoryItem =
  | string
  | {
      id?: string | number;
      role?: string;
      content?: string;
      text?: string;
      message?: string;
      query?: string;
      question?: string;
      prompt?: string;
      answer?: string;
      response?: string;
      user_message?: string;
      assistant_message?: string;
      user?: string;
      assistant?: string;
      sources?: NotebookChatSource[];
      references?: NotebookChatSource[];
      citations?: NotebookChatSource[];
      contexts?: NotebookChatSource[];
      created_at?: string;
      [key: string]: unknown;
    };

export type NotebookChatHistoryResponse =
  | NotebookChatHistoryItem[]
  | {
      messages?: NotebookChatHistoryItem[];
      history?: NotebookChatHistoryItem[];
      items?: NotebookChatHistoryItem[];
      chat?: NotebookChatHistoryItem[];
      data?: NotebookChatHistoryItem[];
      [key: string]: unknown;
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

export type NotebookContourBody = {
  contour: NotebookContour;
};

export type NotebookQuestionsBody = {
  context?: "general" | "credit" | "legal" | "financial" | string;
};

export type NotebookPresentationBody = {
  title?: string;
  style?: "business" | "academic" | "popular" | string;
};

export type NotebookFlashcardsCheckBody = {
  question: string;
  correct_answer: string;
  user_answer: string;
};

export type NotebookFlashcardsCheckResult = {
  is_correct?: boolean;
  score?: number;
  feedback?: string;
  [key: string]: unknown;
};

export type NotebookCompareBody = {
  notebook_ids: [string, string];
};

export type NotebookSearchBody = {
  notebook_ids: string[];
  query: string;
};

export type NotebookSearchResult = {
  answer?: string;
  notebooks_searched?: string[];
  [key: string]: unknown;
};

export type NotebookCompareChange = {
  section?: string;
  type?: string;
  description?: string;
  severity?: string;
  [key: string]: unknown;
};

export type NotebookCompareResult = {
  changes?: NotebookCompareChange[];
  summary?: string;
  risk_level?: string;
  label_a?: string;
  label_b?: string;
  [key: string]: unknown;
};

export type PodcastResponse = {
  audio_url?: string;
  [key: string]: unknown;
};
