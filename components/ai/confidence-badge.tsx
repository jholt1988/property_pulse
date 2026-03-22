import { StatusBadge } from "@/components/ui/status-badge";

export function ConfidenceBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone = normalized.includes("high") ? "success" : normalized.includes("low") ? "warning" : "info";
  return <StatusBadge tone={tone} label={value} />;
}
