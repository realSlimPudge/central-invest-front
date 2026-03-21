import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Presentation } from "lucide-react";
import { toast } from "sonner";

import { notebookApi } from "@/entities/notebook/api/notebook.api";
import { notebookKeys } from "@/entities/notebook/api/notebook.keys";
import type {
  NotebookPresentation,
  NotebookPresentationSlide,
} from "@/entities/notebook/api/dto/notebook.types";
import { ArtifactPlaceholder } from "@/features/notebook-artifacts/ui/ArtifactPlaceholder";
import { getNotebookErrorMessage } from "@/features/notebook-workspace/lib/notebook-ui";
import { presentationStyleOptions } from "@/features/notebook-workspace/model/notebook-workspace";
import { useNotebookRoute } from "@/features/notebook-workspace/model/use-notebook-route";
import { NotebookModuleHeader } from "@/features/notebook-workspace/ui/NotebookModuleHeader";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/shared/components/ui/carousel";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

function asPresentation(
  value: NotebookPresentation | Record<string, unknown> | null | undefined,
) {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as NotebookPresentation;
}

export function NotebookPresentationPage() {
  const queryClient = useQueryClient();
  const { notebookId, notebook } = useNotebookRoute();
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState("business");
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeSlide, setActiveSlide] = useState(0);
  const presentation = asPresentation(notebook?.presentation);
  const slides = Array.isArray(presentation?.slides)
    ? (presentation?.slides as NotebookPresentationSlide[])
    : [];

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const syncSlide = () => {
      setActiveSlide(carouselApi.selectedScrollSnap());
    };

    syncSlide();
    carouselApi.on("select", syncSlide);
    carouselApi.on("reInit", syncSlide);

    return () => {
      carouselApi.off("select", syncSlide);
      carouselApi.off("reInit", syncSlide);
    };
  }, [carouselApi]);

  const previewMutation = useMutation({
    mutationKey: notebookKeys.presentation(),
    mutationFn: () =>
      notebookApi.presentationPreview(notebookId, { style, title }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notebookKeys.detail(notebookId),
      });
      toast.success("Превью презентации обновлено");
    },
    onError: (error) => {
      toast.error(
        getNotebookErrorMessage(error, "Не удалось собрать превью презентации"),
      );
    },
  });

  const downloadMutation = useMutation({
    mutationKey: [...notebookKeys.presentation(), "download"],
    mutationFn: () =>
      notebookApi.presentationDownload(notebookId, { style, title }),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "presentation.pptx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Презентация скачана");
    },
    onError: (error) => {
      toast.error(
        getNotebookErrorMessage(error, "Не удалось скачать презентацию"),
      );
    },
  });

  return (
    <div className="space-y-6">
      <NotebookModuleHeader
        actions={
          <>
            <Input
              className="sm:w-56"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Заголовок презентации"
              value={title}
            />
            <Select onValueChange={setStyle} value={style}>
              <SelectTrigger className="h-11 w-full sm:w-48">
                <SelectValue placeholder="Выбери стиль" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {presentationStyleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              disabled={previewMutation.isPending}
              onClick={() => void previewMutation.mutateAsync()}
              type="button"
            >
              <Presentation className="size-4" />
              {slides.length > 0 ? "Обновить превью" : "Собрать превью"}
            </Button>
            <Button
              disabled={downloadMutation.isPending}
              onClick={() => void downloadMutation.mutateAsync()}
              type="button"
              variant="outline"
            >
              <Download className="size-4" />
              Скачать PPTX
            </Button>
          </>
        }
        description="Сначала собери структуру слайдов, потом пролистай превью как полноценную презентацию и скачай готовый `.pptx`."
        title="Презентация"
      />

      {slides.length > 0 ? (
        <div className="space-y-4">
          <Card className="ring-1 ring-border/80">
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-xl text-foreground">
                  Предпросмотр слайдов
                </CardTitle>
                <CardDescription>
                  Переключай слайды через swiper и смотри итоговую структуру как
                  настоящую презентацию.
                </CardDescription>
              </div>
              <div className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground">
                Слайд {activeSlide + 1} из {slides.length}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <Carousel className="px-2 md:px-10" setApi={setCarouselApi}>
                <CarouselContent>
                  {slides.map((slide, index) => (
                    <CarouselItem key={`${slide.title}-${index}`}>
                      <div className="aspect-[16/9] rounded-[2rem] border border-border bg-card p-6 shadow-sm md:p-10">
                        <div className="flex h-full flex-col">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                Слайд {index + 1}
                              </p>
                              <h3 className="mt-4 text-3xl font-semibold leading-tight text-foreground md:text-4xl">
                                {slide.title || "Без названия"}
                              </h3>
                              {slide.subtitle && (
                                <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                                  {slide.subtitle}
                                </p>
                              )}
                            </div>

                            <div className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
                              {slide.type || "content"}
                            </div>
                          </div>

                          <div className="mt-8 flex-1">
                            {Array.isArray(slide.bullets) &&
                            slide.bullets.length > 0 ? (
                              <div className="grid gap-3 md:grid-cols-2">
                                {slide.bullets.map((bullet, bulletIndex) => (
                                  <div
                                    key={`${index}-${bulletIndex}`}
                                    className="rounded-3xl border border-border bg-muted/35 px-4 py-4 text-sm leading-7 text-foreground md:text-base"
                                  >
                                    {bullet}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-border bg-muted/25 px-6 py-8 text-center text-sm leading-7 text-muted-foreground md:text-base">
                                Для этого слайда бэкенд не прислал bullets. Тип:
                                {" "}
                                {slide.type || "content"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0 md:-left-2" />
                <CarouselNext className="right-0 md:-right-2" />
              </Carousel>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {slides.map((slide, index) => (
                  <button
                    key={`${slide.title}-${index}-thumb`}
                    className={cn(
                      "min-w-40 rounded-2xl border px-4 py-3 text-left transition-colors",
                      activeSlide === index
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/40",
                    )}
                    onClick={() => carouselApi?.scrollTo(index)}
                    type="button"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Слайд {index + 1}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-foreground">
                      {slide.title || "Без названия"}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : notebook?.presentation ? (
        <Card className="ring-1 ring-border/80">
          <CardContent className="p-6">
            <pre className="overflow-x-auto text-sm leading-6 text-muted-foreground">
              {JSON.stringify(notebook.presentation, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <ArtifactPlaceholder
          title="Презентация пока не собрана"
          description="Собери превью, чтобы увидеть структуру будущих слайдов, а затем скачай готовый PPTX."
        />
      )}
    </div>
  );
}
