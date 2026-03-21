import { authOptions } from "@/entities/auth/api/auth.options";
import { setAccessToken } from "@/shared/lib/access-token";
import { queryClient } from "@/shared/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

export function useLoginMutation() {
  const login = useMutation({
    ...authOptions.login(),
    onSuccess: async (data) => {
      setAccessToken(data.access_token);
      await queryClient.fetchQuery(authOptions.me());
    },
  });

  return {
    isLoading: login.isPending,
    login: login.mutateAsync,
    error: login.error,
  };
}
