import { Skeleton } from "@/shared/components/ui/skeleton";

import type { NotebookContour } from "@/entities/notebook/api/dto/notebook.types";
import { NotebookActionsDropdown } from "@/features/notebook-actions/ui/NotebookActionsDropdown";
import { getNotebookModuleAvailabilityMap } from "@/features/notebook-workspace/model/notebook-module-availability";
import { NotebookSectionMenu } from "@/features/notebook-workspace/ui/NotebookSectionMenu";
import { Lock, LockOpen } from "lucide-react";

type NotebookWorkspaceDesktopHeaderProps = {
  title?: string;
  contour?: NotebookContour;
  isPending: boolean;
  notebookId: string;
  pathname: string;
  moduleAvailability: ReturnType<typeof getNotebookModuleAvailabilityMap>;
};

export function NotebookWorkspaceDesktopHeader({
  title,
  contour,
  isPending,
  notebookId,
  pathname,
  moduleAvailability,
}: NotebookWorkspaceDesktopHeaderProps) {
  return (
    <div className="sticky top-0 left-0 w-full z-30 hidden lg:block ">
      <div className="grid h-13 py-2 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-6 bg-sidebar border border-sidebar-border border-t-transparent border-l-transparent px-5 ">
        <div className="min-w-0">
          {isPending ? (
            <Skeleton className="h-8 w-64 rounded-xl" />
          ) : (
            <div className="flex items-center gap-2">
              {contour === "closed" ? (
                <Lock className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <LockOpen className="size-4 shrink-0 text-muted-foreground" />
              )}
              <p className="truncate text-lg font-semibold text-foreground">
                {title ?? "Блокнот"}
              </p>
            </div>
          )}
        </div>

        <NotebookSectionMenu
          className="justify-self-center"
          compact
          moduleAvailability={moduleAvailability}
          notebookId={notebookId}
          pathname={pathname}
        />

        <div className="justify-self-end">
          {isPending || !title ? (
            <Skeleton className="size-8 rounded-xl" />
          ) : (
            <NotebookActionsDropdown
              contour={contour}
              notebookId={notebookId}
              title={title}
            />
          )}
        </div>
      </div>
    </div>
  );
}
