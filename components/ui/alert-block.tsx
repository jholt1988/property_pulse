import { cn } from "@/lib/utils";

type AlertTone = "info" | "success" | "warning" | "error";

const toneClasses: Record<AlertTone, string> = {
  info: "border-keyring-info/30 bg-keyring-info/10 text-blue-100",
  success: "border-keyring-success/30 bg-keyring-success/10 text-emerald-100",
  warning: "border-keyring-warning/30 bg-keyring-warning/10 text-amber-100",
  error: "border-keyring-error/30 bg-keyring-error/10 text-red-100",
};

export function AlertBlock({
  title,
  message,
  tone = "info",
  className,
}: {
  title?: string;
  message: string;
  tone?: AlertTone;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border p-3 text-sm", toneClasses[tone], className)}>
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      <p>{message}</p>
    </div>
  );
}
