import * as z from "zod";

export const renameNotebookScheme = z.object({
  title: z
    .string()
    .min(3, "Минимум 3 символа")
    .max(50, "Максимум 50 символов"),
});
