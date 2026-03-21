import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { Toaster } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
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
  component: () => (
    <div>
      <SidebarProvider>
        <TooltipProvider>
          <AppSidebar />
          <SidebarInset>
            <Outlet />
            <Toaster />
          </SidebarInset>
        </TooltipProvider>
      </SidebarProvider>
    </div>
  ),
});
