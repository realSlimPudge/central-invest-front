import { Link } from "@tanstack/react-router";
import { CircleSlash, FolderOpen } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";

type NotebookModuleUnavailableProps = {
  notebookId: string;
  title: string;
  reason: string;
};

export function NotebookModuleUnavailable({
  notebookId,
  title,
  reason,
}: NotebookModuleUnavailableProps) {
  return (
    <Empty className="rounded-3xl border border-border bg-card py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleSlash />
        </EmptyMedia>
        <EmptyTitle className="text-xl text-foreground">
          {title} недоступен
        </EmptyTitle>
        <EmptyDescription className="text-base">
          {reason}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild variant="outline">
          <Link params={{ id: notebookId }} resetScroll={false} to="/notebooks/$id/sources">
            <FolderOpen data-icon="inline-start" />
            Проверить источники
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
