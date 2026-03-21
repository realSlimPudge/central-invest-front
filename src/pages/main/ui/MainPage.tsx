import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { TextAnimate } from "@/shared/components/ui/text-animate";
import { useAuth } from "@/entities/auth/lib/use-auth";

export function MainPage() {
  const { user } = useAuth();
  const link = () => {
    if (user) {
      return "/notebooks";
    }
    return "/login";
  };
  return (
    <section className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-12 text-foreground sm:px-6 sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--card),transparent_52%)] opacity-90" />
      <div className="pointer-events-none absolute left-1/2 top-16 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/12 blur-3xl sm:top-24 sm:h-72 sm:w-72" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground shadow-sm sm:mb-8 sm:px-5 sm:py-2 sm:text-sm">
          Рабочее пространство для документов и знаний
          <ArrowRight className="size-4 text-muted-foreground" />
        </div>

        <TextAnimate
          as="h1"
          animation="blurInUp"
          by="word"
          className="max-w-5xl text-4xl leading-[0.95] font-semibold tracking-[-0.06em] text-[var(--text-h)] sm:text-6xl lg:text-7xl"
        >
          Central AI помогает превращать документы в структурированные знания
        </TextAnimate>

        <TextAnimate
          as="p"
          animation="fadeIn"
          delay={0.2}
          by="line"
          className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground sm:mt-8 sm:text-xl sm:leading-8"
        >
          Загружай материалы, общайся с источниками, собирай саммари,
          интеллект-карты и таблицы в одном понятном интерфейсе с прозрачной
          логикой и единым контекстом.
        </TextAnimate>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button
            asChild
            className="h-11 w-full rounded-xl px-7 text-base sm:h-12 sm:w-auto"
          >
            <Link to={link()}>Начать работу</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
