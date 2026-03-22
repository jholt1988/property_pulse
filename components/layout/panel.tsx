import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-[var(--kr-border-primary)] bg-keyring-panel", className)}>{children}</div>;
}
