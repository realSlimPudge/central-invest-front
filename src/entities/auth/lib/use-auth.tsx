import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { ACCESS_TOKEN } from "@/shared/constants/auth-token";
import { authOptions } from "../api/auth.options";
import { authKeys } from "../api/auth.keys";
import type { User } from "../model/user";

type AuthState =
  | { user: null; status: "PENDING" }
  | { user: null; status: "UNAUTHENTICATED" }
  | { user: User; status: "AUTHENTICATED" };

type AuthUtils = {
  // signIn: () => void;
  signOut: () => void;
  ensureData: () => Promise<User | null | undefined>;
};

type AuthData = AuthState & AuthUtils;

function useAuth(): AuthData {
  const queryClient = useQueryClient();

  const authQuery = useQuery(authOptions.me());

  const logout = useMutation({
    ...authOptions.logout(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me(), null);
      Cookies.remove(ACCESS_TOKEN);
    },
  });

  useEffect(() => {
    if (authQuery.error === null) return;
    queryClient.setQueryData(authKeys.me(), null);
  }, [authQuery.error, queryClient]);

  const utils: AuthUtils = {
    signOut: () => {
      logout.mutate();
    },
    ensureData: () => {
      return queryClient.ensureQueryData(authOptions.me());
    },
  };

  //return value all states
  switch (true) {
    case authQuery.isPending:
      return { ...utils, user: null, status: "PENDING" };

    case !authQuery.data:
      return { ...utils, user: null, status: "UNAUTHENTICATED" };

    default:
      return { ...utils, user: authQuery.data, status: "AUTHENTICATED" };
  }
}

export { useAuth };
export type { AuthData };
