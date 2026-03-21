import { authKeys } from "@/entities/auth/api/auth.keys";
import { authOptions } from "@/entities/auth/api/auth.options";
import { ACCESS_TOKEN } from "@/shared/constants/auth-token";
import { queryClient } from "@/shared/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { toast } from "sonner";

export function useRegisterMutation() {
  const login = useMutation({
    ...authOptions.login(),
    onSuccess: async (data) => {
      Cookies.set(ACCESS_TOKEN, data.access_token);
      await queryClient.fetchQuery({ queryKey: authKeys.me() });
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
