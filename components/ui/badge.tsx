import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "success" | "warning" | "error" | "info" | "pending";

const toneMap: Record<BadgeTone, string> = {
  success: "border-keyring-success/30 bg-keyring-success/10 text-keyring-success",
  warning: "border-keyring-warning/30 bg-keyring-warning/10 text-keyring-warning",
  error: "border-keyring-error/30 bg-keyring-error/10 text-keyring-error",
  info: "border-keyring-info/30 bg-keyring-info/10 text-keyring-info",
  pending: "border-keyring-pending/30 bg-keyring-pending/10 text-keyring-pending",
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
