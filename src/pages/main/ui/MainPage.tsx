import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { TextAnimate } from "@/shared/components/ui/text-animate";
import { useAuth } from "@/entities/auth/lib/use-auth";

export function MainPage() {
  const { user } = useAuth();
  const link = () => {
    if (user) {
      return "/dashboard";
    }
    return "/login";
  };
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-16 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--card),transparent_52%)] opacity-90" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-sm text-muted-foreground shadow-sm">
          Рабочее пространство для документов и знаний
          <ArrowRight className="size-4 text-muted-foreground" />
        </div>

        <TextAnimate
          as="h1"
          animation="blurInUp"
          by="word"
          className="max-w-5xl text-5xl leading-[0.95] font-semibold tracking-[-0.06em] text-[var(--text-h)] sm:text-6xl lg:text-7xl"
        >
          Central AI помогает превращать документы в структурированные знания
        </TextAnimate>

        <TextAnimate
          as="p"
          animation="fadeIn"
          delay={0.2}
          by="line"
          className="mt-8 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl"
        >
          Загружай материалы, общайся с источниками, собирай саммари,
          интеллект-карты и таблицы в одном понятном интерфейсе с прозрачной
          логикой и единым контекстом.
        </TextAnimate>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button asChild className="h-12 rounded-xl px-7 text-base">
            <Link to={link()}>Начать работу</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
