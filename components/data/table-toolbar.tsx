import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TableToolbar({
  left,
  right,
  className,
}: {
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--kr-border-primary)] bg-keyring-panel px-3 py-2", className)}>
      <div className="flex items-center gap-2">{left}</div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}
