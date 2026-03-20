import { HoleBackground } from "@/shared/components/ui/hole";

export function MainPage() {
  return (
    <section>
      <div className="absolute z-10">
        <div className="w-dvw h-dvh flex justify-center items-center">
          <h1>Central AI</h1>
        </div>
      </div>
      <HoleBackground className="absolute inset-0 flex items-center justify-center rounded-xl" />
    </section>
  );
}
