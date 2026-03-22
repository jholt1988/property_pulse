import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/ai/confidence-badge";

export function AIInsightCard({
  title,
  description,
  confidence,
}: {
  title: string;
  description: string;
  confidence: string;
}) {
  return (
    <div className="rounded-xl border border-keyring-ai/20 bg-keyring-ai/10 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="text-lg font-semibold text-white">{title}</div>
        <ConfidenceBadge value={confidence} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
      <div className="mt-4 flex gap-2">
        <Button size="sm">Accept Action</Button>
        <Button variant="secondary" size="sm">Review Trace</Button>
      </div>
    </div>
  );
}
