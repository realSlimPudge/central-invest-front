import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { QueryClient } from "@tanstack/react-query";
import type { AuthData } from "@/entities/auth/lib/use-auth";

type RouterContext = {
  queryClient: QueryClient;
  auth: AuthData;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

//eslint-disable-next-line
function RootComponent() {
  return (
    <>
      <Outlet />
      <ReactQueryDevtools />
    </>
  );
}
