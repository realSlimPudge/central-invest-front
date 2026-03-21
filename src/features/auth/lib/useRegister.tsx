import { authOptions } from "@/entities/auth/api/auth.options";
import { setAccessToken } from "@/shared/lib/access-token";
import { queryClient } from "@/shared/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useRegisterMutation() {
  const login = useMutation({
    ...authOptions.login(),
    onSuccess: async (data) => {
      setAccessToken(data.access_token);
      await queryClient.fetchQuery(authOptions.me());
      toast.success("Вы успешно вошли в аккаунт", { position: "top-center" });
    },
    onError: () => {
      toast.error("Неверные данные", { position: "top-center" });
    },
  });

  const register = useMutation({
    ...authOptions.register(),
    onSuccess: (_, body) => {
      login.mutate(body);
      toast.success("Аккаунт создан. Теперь войдите в систему", {
        position: "top-center",
      });
    },
    onError: () => {
      toast.error("Не удалось создать аккаунт", { position: "top-center" });
    },
  });

  return {
    register: register.mutateAsync,
    error: register.error || login.error,
    isLoading: register.isPending || login.isPending,
  };
}
