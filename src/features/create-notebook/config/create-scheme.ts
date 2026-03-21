import * as z from "zod";

export const createNotebookScheme = z.object({
  title: z
    .string()
    .min(3, "Минимум 5 символов")
    .max(25, "Максимум 25 символов"),
});
