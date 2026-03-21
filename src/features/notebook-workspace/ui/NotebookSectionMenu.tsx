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
import { NotebookSectionMenuMobile } from "@/features/notebook-workspace/ui/NotebookSectionMenuMobile";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";

const notebookNavigationItemClassName =
  "flex w-full min-h-20 min-w-0 items-start gap-3 rounded-xl px-3 py-3 no-underline outline-none transition-colors select-none";

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
          "flex size-9 items-center justify-center rounded-lg bg-muted/60 text-foreground transition-colors",
          isActive && "bg-muted text-foreground",
          disabled && "bg-muted/40 text-muted-foreground",
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
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
            <span className="text-[11px] text-muted-foreground">
              Недоступно
            </span>
          ) : null}
        </div>
        <div className="line-clamp-3 w-full leading-5 text-muted-foreground wrap-break-word">
          {disabled ? (reason ?? description) : description}
        </div>
      </div>
    </>
  );

  if (disabled) {
    return (
      <li className="min-w-0 w-full" {...props}>
        <div
          aria-disabled="true"
          className={cn(
            notebookNavigationItemClassName,
            "cursor-not-allowed opacity-70",
          )}
          data-module={module}
        >
          {content}
        </div>
      </li>
    );
  }

  return (
    <li className="min-w-0 w-full" {...props}>
      <NavigationMenuLink asChild>
        <Link
          className={cn(
            notebookNavigationItemClassName,
            "bg-transparent hover:bg-muted/50 focus:bg-muted/50",
            isActive && "bg-muted/70",
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
  const isMobile = useIsMobile();

  if (!compact && isMobile) {
    return (
      <NotebookSectionMenuMobile
        moduleAvailability={moduleAvailability}
        notebookId={notebookId}
        pathname={pathname}
      />
    );
  }

  return (
    <NavigationMenu
      className={cn(
        "w-full max-w-full justify-start",
        compact && "justify-center",
        className,
      )}
      delayDuration={0}
      skipDelayDuration={0}
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
                    ? "h-8 rounded-full bg-card px-4 text-sm text-foreground hover:bg-muted/60 focus:bg-muted/60 data-[open]:bg-muted/70"
                    : "h-10 rounded-full bg-card px-4 text-foreground hover:bg-muted/60 focus:bg-muted/60 data-[open]:bg-muted/70",
                  sectionActive && "bg-muted/70 text-foreground",
                )}
              >
                {section.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="z-20">
                <div className="box-border w-[340px] p-3 md:w-[720px] lg:w-[780px]">
                  <ul className="grid gap-2 md:grid-cols-2">
                    {section.items.map(
                      ({
                        module,
                        to,
                        label,
                        description,
                        icon: Icon,
                        exact,
                      }) => {
                        const resolvedPath = resolveNotebookPath(
                          to,
                          notebookId,
                        );
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
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
