import { cn } from "@/lib/utils";

type StatusTone = "success" | "warning" | "error" | "info" | "pending" | "neutral";

const toneClasses: Record<StatusTone, string> = {
  success: "border-keyring-success/30 bg-keyring-success/10 text-keyring-success",
  warning: "border-keyring-warning/30 bg-keyring-warning/10 text-keyring-warning",
  error: "border-keyring-error/30 bg-keyring-error/10 text-keyring-error",
  info: "border-keyring-info/30 bg-keyring-info/10 text-keyring-info",
  pending: "border-keyring-pending/30 bg-keyring-pending/10 text-keyring-pending",
  neutral: "border-[var(--kr-border-primary)] bg-white/5 text-keyring-gray",
};

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", toneClasses[tone], className)}>
      {label}
    </span>
  );
}
