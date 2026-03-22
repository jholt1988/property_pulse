import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-[24px] border border-white/10 bg-[#111827]", className)}>{children}</div>;
}
