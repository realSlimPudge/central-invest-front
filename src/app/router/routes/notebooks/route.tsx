import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { Toaster } from "@/shared/components/ui/sonner";
import { Spinner } from "@/shared/components/ui/spinner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { AppHeader } from "@/widgets/app-header/ui/AppHeader";
import { AppSidebar } from "@/widgets/app-sidebar/ui/AppSidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/notebooks")({
  beforeLoad: async ({ context, location }) => {
    const user = await context.auth.ensureData().catch(() => null);
    if (!user) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  pendingComponent: () => (
    <div className="w-dvw h-dvh flex flex-col gap-y-2 items-center justify-center">
      <Spinner />
    </div>
  ),

  component: () => (
    <SidebarProvider>
      <TooltipProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="relative">
            <AppHeader />
            <Outlet />
            <Toaster />
          </div>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  ),
});
