import type { NotebookVoiceRecord } from "@/entities/notebook/api/dto/notebook.types";

export type PodcastVoiceOption = {
  id: string;
  label: string;
  description?: string;
};

const voiceIdKeys = ["id", "voice_id", "voice"] as const;
const voiceLabelKeys = ["name", "label", "title", "voice"] as const;
const voiceDescriptionKeys = [
  "description",
  "language",
  "lang",
  "locale",
  "gender",
  "provider",
  "model",
] as const;

function getFirstString(
  record: NotebookVoiceRecord,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getDescription(record: NotebookVoiceRecord) {
  const values = voiceDescriptionKeys
    .map((key) => record[key])
    .filter(
      (value): value is string =>
        typeof value === "string" && Boolean(value.trim()),
    )
    .map((value) => value.trim());

  return values.length > 0 ? values.join(" · ") : undefined;
}

export function normalizePodcastVoices(
  value: NotebookVoiceRecord[] | null | undefined,
) {
  if (!Array.isArray(value)) {
    return [] as PodcastVoiceOption[];
  }

  const seen = new Set<string>();

  return value
    .map<PodcastVoiceOption | null>((record, index) => {
      const id = getFirstString(record, voiceIdKeys) ?? `voice-${index + 1}`;

      if (seen.has(id)) {
        return null;
      }

      seen.add(id);

      return {
        id,
        label: getFirstString(record, voiceLabelKeys) ?? `Голос ${index + 1}`,
        description: getDescription(record),
      };
    })
    .filter((voice): voice is PodcastVoiceOption => voice !== null);
}
