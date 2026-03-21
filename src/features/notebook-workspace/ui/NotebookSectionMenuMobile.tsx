import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";

import { type NotebookModuleAvailabilityMap } from "@/features/notebook-workspace/model/notebook-module-availability";
import { notebookWorkspaceSections } from "@/features/notebook-workspace/model/notebook-workspace";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type NotebookSectionMenuMobileProps = {
  notebookId: string;
  pathname: string;
  moduleAvailability: NotebookModuleAvailabilityMap;
};

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

export function NotebookSectionMenuMobile({
  notebookId,
  pathname,
  moduleAvailability,
}: NotebookSectionMenuMobileProps) {
  const navigate = useNavigate();

  const activeModule = useMemo(() => {
    for (const section of notebookWorkspaceSections) {
      for (const item of section.items) {
        const resolvedPath = resolveNotebookPath(item.to, notebookId);

        if (isNotebookSectionPathActive(pathname, resolvedPath, item.exact)) {
          return item.module;
        }
      }
    }

    return undefined;
  }, [notebookId, pathname]);

  return (
    <div className="space-y-2">
      <p className="px-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
        Навигация
      </p>
      <Select
        onValueChange={(value) => {
          for (const section of notebookWorkspaceSections) {
            const matchedItem = section.items.find((item) => item.module === value);

            if (matchedItem) {
              void navigate({
                to: matchedItem.to,
                params: { id: notebookId },
                resetScroll: false,
              });
              return;
            }
          }
        }}
        value={activeModule}
      >
        <SelectTrigger className="h-11 w-full rounded-2xl bg-card px-4">
          <SelectValue placeholder="Выберите раздел" />
        </SelectTrigger>
        <SelectContent className="max-w-[calc(100vw-2rem)]">
          {notebookWorkspaceSections.map((section) => (
            <SelectGroup key={section.label}>
              <SelectLabel>{section.label}</SelectLabel>
              {section.items.map((item) => {
                const availability = moduleAvailability[item.module];
                const Icon = item.icon;

                return (
                  <SelectItem
                    disabled={!availability.enabled}
                    key={item.module}
                    value={item.module}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Icon />
                      <span className="truncate">
                        {item.label}
                        {!availability.enabled ? " — недоступно" : ""}
                      </span>
                    </span>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
