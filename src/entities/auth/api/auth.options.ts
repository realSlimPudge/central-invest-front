import {
  queryOptions,
  mutationOptions,
  QueryCache,
} from "@tanstack/react-query";
import { authKeys } from "./auth.keys";
import Cookies from "js-cookie";
import { authApi } from "./auth.api";
import { ACCESS_TOKEN } from "@/shared/constants/auth-token";

const queryCache = new QueryCache();

export const authOptions = {
  login: () =>
    mutationOptions({
      mutationKey: authKeys.login(),
      mutationFn: authApi.login,
      onError: () => {
        Cookies.remove(ACCESS_TOKEN);
      },
    }),
  me: () =>
    queryOptions({
      queryKey: authKeys.me(),
      queryFn: () => authApi.me(),
      staleTime: 1000 * 60 * 5, //5 mimutes
      retry: 1,
      refetchOnWindowFocus: true,
    }),
  logout: () =>
    mutationOptions({
      mutationKey: authKeys.logout(),
      mutationFn: () => authApi.logout(),
      onSuccess: () => queryCache.clear(),
    }),
};
