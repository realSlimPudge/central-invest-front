import { authKeys } from "@/entities/auth/api/auth.keys";
import { authOptions } from "@/entities/auth/api/auth.options";
import { ACCESS_TOKEN } from "@/shared/constants/auth-token";
import { queryClient } from "@/shared/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";

export function useLoginMutation() {
  const login = useMutation({
    ...authOptions.login(),
    onSuccess: async (data) => {
      Cookies.set(ACCESS_TOKEN, data.access_token);
      await queryClient.fetchQuery({ queryKey: authKeys.me() });
    },
  });

  return {
    isLoading: login.isPending,
    login: login.mutateAsync,
    error: login.error,
  };
}
