import { useEffect, useState } from "react";

import type { NotebookPresentationSlide } from "@/entities/notebook/api/dto/notebook.types";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/shared/components/ui/carousel";
import { cn } from "@/shared/lib/utils";

export function NotebookPresentationPreview({
  slides,
}: {
  slides: NotebookPresentationSlide[];
}) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeSlide, setActiveSlide] = useState(0);

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

  return (
    <div className="space-y-4">
      <div className="space-y-5">
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
                        {slide.subtitle ? (
                          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                            {slide.subtitle}
                          </p>
                        ) : null}
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
                          Для этого слайда пока нет основных пунктов. Раздел:{" "}
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
      </div>
    </div>
  );
}
