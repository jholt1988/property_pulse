import { ModuleKey, moduleAccentClasses } from "@/lib/tokens";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ApprovalRow({
  title,
  confidence,
  module,
}: {
  title: string;
  confidence: string;
  module: ModuleKey;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start gap-3">
        <div className={cn("mt-1 h-2.5 w-2.5 rounded-full", moduleAccentClasses[module])} />
        <div>
          <div className="text-sm font-medium text-white">{title}</div>
          <div className="mt-1 text-xs text-slate-400">{confidence}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">Reject</Button>
        <Button size="sm">Approve</Button>
      </div>
    </div>
  );
}
