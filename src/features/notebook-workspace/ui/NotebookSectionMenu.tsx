import type { ComponentPropsWithoutRef } from "react";

import { Link } from "@tanstack/react-router";

import {
  getNotebookModuleAvailabilityMap,
  type NotebookModuleId,
} from "@/features/notebook-workspace/model/notebook-module-availability";
import {
  type NotebookWorkspaceSection,
  notebookWorkspaceSections,
} from "@/features/notebook-workspace/model/notebook-workspace";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/shared/components/ui/navigation-menu";
import { cn } from "@/shared/lib/utils";

function resolveNotebookPath(template: string, notebookId: string) {
  return template.replace("$id", notebookId);
}

function isNotebookSectionPathActive(
  pathname: string,
  path: string,
  exact?: boolean,
) {
  return exact
    ? pathname === path
    : pathname === path || pathname.startsWith(`${path}/`);
}

function isSectionActive(
  pathname: string,
  notebookId: string,
  section: NotebookWorkspaceSection,
) {
  return section.items.some((item) =>
    isNotebookSectionPathActive(
      pathname,
      resolveNotebookPath(item.to, notebookId),
      item.exact,
    ),
  );
}

type NotebookNavigationItemProps = ComponentPropsWithoutRef<"li"> & {
  module: NotebookModuleId;
  to: string;
  title: string;
  description: string;
  notebookId: string;
  icon: NotebookWorkspaceSection["items"][number]["icon"];
  isActive: boolean;
  disabled?: boolean;
  reason?: string;
};

function NotebookNavigationItem({
  module,
  to,
  title,
  description,
  notebookId,
  icon: Icon,
  isActive,
  disabled,
  reason,
  ...props
}: NotebookNavigationItemProps) {
  const content = (
    <>
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-foreground",
          isActive && "border-primary/20 bg-primary/10 text-foreground",
          disabled && "border-border bg-muted/60 text-muted-foreground",
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="flex min-w-0 max-w-[80%] flex-col gap-1 text-sm">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "leading-none font-medium text-foreground",
              disabled && "text-muted-foreground",
            )}
          >
            {title}
          </div>
          {disabled ? (
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Недоступно
            </span>
          ) : null}
        </div>
        <div className="line-clamp-3 w-full truncate leading-5 text-muted-foreground wrap-break-word">
          {disabled ? (reason ?? description) : description}
        </div>
      </div>
    </>
  );

  if (disabled) {
    return (
      <li {...props}>
        <div
          aria-disabled="true"
          className="flex min-h-20 min-w-0 cursor-not-allowed gap-3 rounded-xl border border-dashed border-border bg-muted/20 no-underline opacity-70 outline-none select-none"
          data-module={module}
        >
          {content}
        </div>
      </li>
    );
  }

  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          className={cn(
            "flex min-h-20 min-w-0 gap-3 rounded-xl border no-underline outline-none transition-colors select-none",
            "border-border bg-card hover:bg-muted focus:bg-muted",
            isActive && "border-primary bg-muted",
          )}
          params={{ id: notebookId }}
          preload="intent"
          resetScroll={false}
          to={to}
        >
          {content}
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

type NotebookSectionMenuProps = {
  notebookId: string;
  pathname: string;
  moduleAvailability: ReturnType<typeof getNotebookModuleAvailabilityMap>;
  compact?: boolean;
  className?: string;
  listClassName?: string;
};

export function NotebookSectionMenu({
  notebookId,
  pathname,
  moduleAvailability,
  compact,
  className,
  listClassName,
}: NotebookSectionMenuProps) {
  return (
    <NavigationMenu
      className={cn(
        "max-w-full justify-start",
        compact && "justify-center",
        className,
      )}
      delayDuration={0}
      skipDelayDuration={0}
      viewport={false}
    >
      <NavigationMenuList
        className={cn(
          "flex-wrap justify-start gap-3",
          compact && "flex-nowrap justify-center gap-2",
          listClassName,
        )}
      >
        {notebookWorkspaceSections.map((section) => {
          const sectionActive = isSectionActive(pathname, notebookId, section);

          return (
            <NavigationMenuItem key={section.label}>
              <NavigationMenuTrigger
                className={cn(
                  navigationMenuTriggerStyle(),
                  compact
                    ? "h-8 rounded-full border border-border bg-card px-4 text-sm text-foreground hover:bg-muted focus:bg-muted data-[open]:bg-muted"
                    : "h-9 rounded-xl border border-border bg-card px-4 text-foreground hover:bg-muted focus:bg-muted data-[open]:bg-muted",
                  sectionActive && "border-primary bg-muted text-foreground",
                )}
              >
                {section.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="z-20 w-[400px] md:w-[540px] lg:w-[640px]">
                <ul className="grid gap-2 md:grid-cols-2">
                  {section.items.map(
                    ({ module, to, label, description, icon: Icon, exact }) => {
                      const resolvedPath = resolveNotebookPath(to, notebookId);
                      const isActive = isNotebookSectionPathActive(
                        pathname,
                        resolvedPath,
                        exact,
                      );
                      const availability = moduleAvailability[module];

                      return (
                        <NotebookNavigationItem
                          description={description}
                          disabled={!availability.enabled}
                          icon={Icon}
                          isActive={isActive}
                          key={to}
                          module={module}
                          notebookId={notebookId}
                          reason={availability.reason}
                          title={label}
                          to={to}
                        />
                      );
                    },
                  )}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
