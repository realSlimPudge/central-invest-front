import { queryClient } from "@/shared/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router/router";
import { useEffect } from "react";
import { useAuth } from "@/entities/auth/lib/use-auth";
import NiceModal from "@ebay/nice-modal-react";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NiceModal.Provider>
        <RouterProviderWithContext />
      </NiceModal.Provider>
    </QueryClientProvider>
  );
}

function RouterProviderWithContext() {
  const auth = useAuth();

  //Ревалидациия роутинга при изменении чувтсвительных данных
  useEffect(() => {
    router.invalidate();
  }, [auth.status, auth.user?.user_id]);

  return <RouterProvider router={router} context={{ auth }} />;
}
export default App;
