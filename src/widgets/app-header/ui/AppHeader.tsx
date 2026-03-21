import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { useIsMobile } from "@/shared/hooks/use-mobile";

export function AppHeader() {
  const isMobile = useIsMobile();
  return (
    <>
      {isMobile && (
        <div className="sticky left-0 top-0 z-40 flex h-13 w-dvw items-center border-b border-border bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger />
        </div>
      )}
    </>
  );
}
