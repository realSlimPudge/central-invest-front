import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { authKeys } from "./auth.keys";
import Cookies from "js-cookie";
import { authApi } from "./auth.api";
import { ACCESS_TOKEN } from "@/shared/constants/auth-token";

export const authOptions = {
  login: () =>
    mutationOptions({
      mutationKey: authKeys.login(),
      mutationFn: authApi.login,
      onError: () => {
        Cookies.remove(ACCESS_TOKEN);
      },
    }),
  register: () =>
    mutationOptions({
      mutationKey: authKeys.register(),
      mutationFn: authApi.register,
    }),
  me: () =>
    queryOptions({
      queryKey: authKeys.me(),
      queryFn: () => authApi.me(),
      staleTime: 1000 * 60 * 5, //5 mimutes
      retry: 1,
      refetchOnWindowFocus: true,
    }),
};
