import type { ComponentPropsWithoutRef } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { FolderPlus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/shared/components/ui/navigation-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import {
  formatNotebookDate,
  getContourDescription,
  getContourLabel,
  getNotebookFilledArtifactsCount,
  getNotebookErrorMessage,
  getReadySourcesCount,
} from "@/features/notebook-workspace/lib/notebook-ui";
import {
  contourOptions,
  type NotebookWorkspaceSection,
  notebookWorkspaceSections,
} from "@/features/notebook-workspace/model/notebook-workspace";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";

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
  to: string;
  title: string;
  description: string;
  notebookId: string;
  icon: NotebookWorkspaceSection["items"][number]["icon"];
  isActive: boolean;
};

function NotebookNavigationItem({
  to,
  title,
  description,
  notebookId,
  icon: Icon,
  isActive,
  ...props
}: NotebookNavigationItemProps) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          className={cn(
            "flex min-h-20 min-w-0 gap-3 rounded-xl border  no-underline outline-none transition-colors select-none",
            "border-border bg-card hover:bg-muted focus:bg-muted",
            isActive && "border-primary bg-muted",
          )}
          params={{ id: notebookId }}
          preload="intent"
          resetScroll={false}
          to={to}
        >
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-foreground",
              isActive && "border-primary/20 bg-primary/10 text-foreground",
            )}
          >
            <Icon className="size-4" />
          </div>
          <div className="flex min-w-0 max-w-[80%] flex-col gap-1 text-sm">
            <div className="leading-none font-medium text-foreground">
              {title}
            </div>
            <div className="line-clamp-3 leading-5 text-muted-foreground truncate wrap-break-word w-full">
              {description}
            </div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

export function NotebookWorkspaceLayout() {
  const queryClient = useQueryClient();
  const { notebookId, notebook, notebookQuery } = useNotebookRoute();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const contourMutation = useMutation({
    mutationKey: notebookKeys.contour(),
    mutationFn: (contour: string) =>
      notebookApi.setContour(notebookId, {
        contour,
      }),
    onSuccess: async (_, contour) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notebookKeys.list() }),
        queryClient.invalidateQueries({
          queryKey: notebookKeys.detail(notebookId),
        }),
      ]);

      toast.success(
        contour === "closed"
          ? "Закрытый контур включен"
          : "Открытый контур включен",
      );
    },
    onError: (error) => {
      toast.error(
        getNotebookErrorMessage(error, "Не удалось переключить контур"),
      );
    },
  });

  const stats = [
    {
      label: "Источники",
      value: notebook?.sources.length ?? 0,
    },
    {
      label: "Готовы",
      value: notebook ? getReadySourcesCount(notebook.sources) : 0,
    },
    {
      label: "Артефакты",
      value: getNotebookFilledArtifactsCount(notebook),
    },
  ];

  return (
    <section className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1480px] space-y-6">
        <Card className="bg-card ring-1 ring-border/80">
          <CardHeader className="gap-6 xl:flex xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                Рабочее пространство блокнота
              </div>

              {notebookQuery.isPending ? (
                <>
                  <Skeleton className="h-11 w-80 rounded-2xl" />
                  <Skeleton className="h-16 w-full max-w-3xl rounded-3xl" />
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <CardTitle className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                      {notebook?.title ?? "Блокнот не найден"}
                    </CardTitle>
                    <CardDescription className="max-w-3xl text-base leading-7">
                      {notebook
                        ? "Один блокнот — все режимы работы: источники, чат, артефакты и аналитические представления поверх одних и тех же документов."
                        : "Загружаю рабочее пространство блокнота."}
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Контур
                      </p>
                      <p className="mt-2 font-medium text-foreground">
                        {getContourLabel(notebook?.contour)}
                      </p>
                      <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                        {getContourDescription(notebook?.contour)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Создан
                      </p>
                      <p className="mt-2 font-medium text-foreground">
                        {notebook
                          ? formatNotebookDate(notebook.created_at)
                          : "—"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:w-[420px]">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border bg-card px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select
                onValueChange={(value) => {
                  if (!value || value === notebook?.contour) {
                    return;
                  }

                  contourMutation.mutate(value);
                }}
                value={notebook?.contour ?? "open"}
              >
                <SelectTrigger className="h-11 w-full sm:w-56">
                  <SelectValue placeholder="Выбери контур" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {contourOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => void notebookQuery.refetch()}
                type="button"
              >
                <RefreshCw className="size-4" />
                Обновить данные
              </Button>
            </div>

            <Button asChild variant="outline">
              <Link to="/notebooks">
                <FolderPlus className="size-4" />
                Новый блокнот
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-visible ring-1 ring-border/80">
          <CardContent className="overflow-visible space-y-4 p-5">
            <NavigationMenu
              className="max-w-full justify-start"
              viewport={false}
            >
              <NavigationMenuList className="flex-wrap justify-start gap-3">
                {notebookWorkspaceSections.map((section) => {
                  const sectionActive = isSectionActive(
                    pathname,
                    notebookId,
                    section,
                  );

                  return (
                    <NavigationMenuItem key={section.label}>
                      <NavigationMenuTrigger
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "h-11 rounded-xl border border-border bg-card px-4 text-foreground hover:bg-muted focus:bg-muted data-[open]:bg-muted",
                          sectionActive &&
                            "border-primary bg-muted text-foreground",
                        )}
                      >
                        {section.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="w-[400px] md:w-[540px] lg:w-[640px] z-20">
                        <ul className="grid gap-2 md:grid-cols-2">
                          {section.items.map(
                            ({ to, label, description, icon: Icon, exact }) => {
                              const resolvedPath = resolveNotebookPath(
                                to,
                                notebookId,
                              );
                              const isActive = isNotebookSectionPathActive(
                                pathname,
                                resolvedPath,
                                exact,
                              );

                              return (
                                <NotebookNavigationItem
                                  description={description}
                                  icon={Icon}
                                  isActive={isActive}
                                  key={to}
                                  notebookId={notebookId}
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
          </CardContent>
        </Card>

        <Outlet />
      </div>
    </section>
  );
}
