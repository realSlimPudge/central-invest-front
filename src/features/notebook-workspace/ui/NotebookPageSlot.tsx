import type { PropsWithChildren } from "react";

import { Slot } from "@/shared/components/ui/slot";

export function NotebookPageSlot({ children }: PropsWithChildren) {
  return (
    <Slot
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div>{children}</div>
    </Slot>
  );
}
