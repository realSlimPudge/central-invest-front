import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { useIsMobile } from "@/shared/hooks/use-mobile";

export function AppHeader() {
  const isMobile = useIsMobile();
  return (
    <>
      {isMobile && (
        <div className="w-dww h-12 sticky left-0 top-0 flex px-2 items-center justify-center">
          <SidebarTrigger />
        </div>
      )}
    </>
  );
}
