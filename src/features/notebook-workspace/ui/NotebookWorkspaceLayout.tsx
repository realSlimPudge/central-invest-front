import { Outlet, useRouterState } from "@tanstack/react-router";
import { getNotebookModuleAvailabilityMap } from "@/features/notebook-workspace/model/notebook-module-availability";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";
import { NotebookPageSlot } from "@/features/notebook-workspace/ui/NotebookPageSlot";
import { NotebookSectionMenu } from "@/features/notebook-workspace/ui/NotebookSectionMenu";
import { NotebookWorkspaceDesktopHeader } from "@/features/notebook-workspace/ui/NotebookWorkspaceDesktopHeader";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function NotebookWorkspaceLayout() {
  const { notebookId, notebook, notebookQuery } = useNotebookRoute();
  const moduleAvailability = getNotebookModuleAvailabilityMap(notebook);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <>
      <NotebookWorkspaceDesktopHeader
        contour={notebook?.contour}
        isPending={notebookQuery.isPending}
        moduleAvailability={moduleAvailability}
        notebookId={notebookId}
        pathname={pathname}
        title={notebook?.title}
      />
      <section className="min-h-dvh bg-background px-3 py-4 text-foreground sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto max-w-[1480px] space-y-4 sm:space-y-6">
          <Card className="overflow-visible ring-1 ring-border/80 lg:hidden">
            <CardContent className="overflow-visible space-y-4 p-3 sm:p-5">
              {notebookQuery.isPending ? (
                <Skeleton className="h-11 w-full rounded-xl" />
              ) : (
                <NotebookSectionMenu
                  moduleAvailability={moduleAvailability}
                  notebookId={notebookId}
                  pathname={pathname}
                />
              )}
            </CardContent>
          </Card>

          <NotebookPageSlot key={pathname}>
            <Outlet />
          </NotebookPageSlot>
        </div>
      </section>
    </>
  );
}
