import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { PlusCircle, User } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { notebookOptions } from "@/entities/notebook/api/notebook.options";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "@/entities/auth/lib/use-auth";
import { AnimatedThemeToggler } from "@/shared/components/ui/animated-theme-toggler";

export function AppSidebar() {
  const { data: notebooks, isLoading } = useQuery({
    ...notebookOptions.list(),
  });

  const { user, status } = useAuth();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-13 flex-row items-center justify-between gap-2 border-b px-2 py-2 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:hidden">
          <span className="font-semibold truncate ">CentralAI</span>
        </div>
        <div className="flex gap-x-2 items-center">
          <AnimatedThemeToggler className="group-data-[collapsible=icon]:hidden" />
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Действия</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Новый блокнот" asChild>
                <Link
                  preloadDelay={500}
                  to="/notebooks"
                  activeOptions={{ exact: true }}
                  className="text-muted-foreground"
                  activeProps={{
                    className:
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                  }}
                >
                  <PlusCircle />
                  <span className="text-md">Новый блокнот</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Блокноты</SidebarGroupLabel>
          {notebooks === undefined || isLoading ? (
            Array.from({ length: 10 }, (_, j) => (
              <SidebarMenuSkeleton showIcon key={j} />
            ))
          ) : (
            <SidebarMenu>
              {notebooks.map((notebook) => (
                <SidebarMenuItem key={notebook.id}>
                  <SidebarMenuButton tooltip={notebook.title} asChild>
                    <Link
                      preloadDelay={500}
                      to="/notebooks/$id"
                      params={{ id: notebook.id }}
                      activeProps={{
                        className:
                          "bg-sidebar-accent  text-sidebar-accent-foreground",
                      }}
                      className={cn(
                        "transition-all duration-300 text-muted-foreground",
                      )}
                    >
                      <span className="text-md">{notebook.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {status === "AUTHENTICATED" && (
              <div className="flex h-8 items-center gap-2 overflow-hidden rounded-md px-2 text-sm text-sidebar-foreground/90 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
                <User className="size-4 shrink-0" />
                <span className="truncate group-data-[collapsible=icon]:hidden">
                  {user?.username}
                </span>
              </div>
            )}
            {status === "PENDING" && (
              <Skeleton className="mx-2 h-10 rounded-xl bg-muted" />
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
