import type { ReactNode } from "react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

type NotebookModuleHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
};

export function NotebookModuleHeader({
  title,
  description,
  actions,
  className,
}: NotebookModuleHeaderProps) {
  return (
    <Card className={cn("bg-card ring-1 ring-border/80", className)}>
      <CardHeader className="gap-4 lg:flex lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl space-y-2">
          <CardTitle className="text-2xl font-semibold text-foreground">
            {title}
          </CardTitle>
          <CardDescription className="text-base leading-7">
            {description}
          </CardDescription>
        </div>

        {actions ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {actions}
          </div>
        ) : null}
      </CardHeader>
    </Card>
  );
}
