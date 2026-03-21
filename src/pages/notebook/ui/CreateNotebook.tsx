import { FileIcon } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { Button } from "@/shared/components/ui/button";
import { Slot } from "@/shared/components/ui/slot";
import NiceModal from "@ebay/nice-modal-react";
import CreateNotebookModal from "@/features/create-notebook/ui/CreateNotebookModal";

export function CreateNotebookPage() {
  const showModal = () => {
    NiceModal.show(CreateNotebookModal);
  };
  return (
    <Slot
      animate={{ y: 0, opacity: 100 }}
      initial={{ y: -10, opacity: 0 }}
      transition={{ type: "tween" }}
    >
      <Empty className="h-full w-full justify-center items-center">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileIcon />
          </EmptyMedia>
          <EmptyTitle className="text-xl">Новый блокнот</EmptyTitle>
          <EmptyDescription className="text-base">
            Создайте новый блокнот
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="lg" onClick={showModal}>
            Создать
          </Button>
        </EmptyContent>
      </Empty>
    </Slot>
  );
}
