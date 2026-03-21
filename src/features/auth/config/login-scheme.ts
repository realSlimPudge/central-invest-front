import * as z from "zod";

export const formSchema = z.object({
  username: z
    .string()
    .min(5, "Логин минимум 5 символов")
    .max(15, "Логин максимум 15 символов"),
  password: z
    .string()
    .min(8, "Пароль минимум 8 символов")
    .max(20, "Пароль максимум 20 символов"),
});
