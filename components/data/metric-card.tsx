export function MetricCard({
  label,
  value,
  delta,
  deltaTone = "text-slate-300",
}: {
  label: string;
  value: string;
  delta: string;
  deltaTone?: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</div>
      <div className={`mt-2 text-sm ${deltaTone}`}>{delta}</div>
    </div>
  );
}
