import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "success" | "warning" | "error" | "info" | "pending";

const toneMap: Record<BadgeTone, string> = {
  success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  warning: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  error: "border-red-400/20 bg-red-400/10 text-red-300",
  info: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  pending: "border-violet-400/20 bg-violet-400/10 text-violet-300",
};

export function Badge({ children, tone = "info", className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-medium", toneMap[tone], className)}>
      {children}
    </span>
  );
}

export function AIChip({ children }: { children: ReactNode }) {
  return <Badge tone="info" className="border-cyan-400/20 bg-cyan-400/10 text-cyan-300">{children}</Badge>;
}
