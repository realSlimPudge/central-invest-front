import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type NotebookModuleHeaderProps = {
  title: string;
  description?: string;
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
    <div
      className={cn(
        "flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center [&>*]:w-full sm:[&>*]:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
