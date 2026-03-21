import NiceModal from "@ebay/nice-modal-react";
import { MoreHorizontal, PencilLine, Shield, Trash2 } from "lucide-react";

import type { NotebookContour } from "@/entities/notebook/api/dto/notebook.types";
import ChangeNotebookAccessModal from "@/features/notebook-access/ui/ChangeNotebookAccessModal";
import DeleteNotebookModal from "@/features/notebook-delete/ui/DeleteNotebookModal";
import RenameNotebookModal from "@/features/notebook-rename/ui/RenameNotebookModal";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

type NotebookActionsDropdownProps = {
  notebookId: string;
  title: string;
  contour?: NotebookContour;
};

const itemClassName =
  "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none transition-colors hover:bg-muted focus:bg-muted data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50";

export function NotebookActionsDropdown({
  notebookId,
  title,
  contour,
}: NotebookActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Действия с блокнотом" size="icon-sm" variant="ghost">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-50 min-w-60 rounded-2xl border border-border bg-popover p-1 shadow-xl"
        side="bottom"
        sideOffset={8}
      >
        <DropdownMenuItem
          className={itemClassName}
          onSelect={() =>
            NiceModal.show(RenameNotebookModal, {
              notebookId,
              title,
            })
          }
        >
          <PencilLine className="size-4 text-muted-foreground" />
          <div className="min-w-0">
            <p className="font-medium">Переименовать</p>
            <p className="text-xs text-muted-foreground">
              Обновить название блокнота.
            </p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          className={itemClassName}
          onSelect={() =>
            NiceModal.show(ChangeNotebookAccessModal, {
              notebookId,
              contour,
            })
          }
        >
          <Shield className="size-4 text-muted-foreground" />
          <div className="min-w-0">
            <p className="font-medium">Изменить доступ</p>
            <p className="text-xs text-muted-foreground">
              Переключить режим доступа к блокноту.
            </p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          className={cn(itemClassName, "text-destructive hover:bg-destructive/10 focus:bg-destructive/10")}
          onSelect={() =>
            NiceModal.show(DeleteNotebookModal, {
              notebookId,
              title,
            })
          }
        >
          <Trash2 className="size-4" />
          <div className="min-w-0">
            <p className="font-medium">Удалить блокнот</p>
            <p className="text-xs text-destructive/80">
              Удалить блокнот и связанные материалы.
            </p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
