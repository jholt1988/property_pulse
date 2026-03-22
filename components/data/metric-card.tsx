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
    <div className="rounded-xl border border-[var(--kr-border-primary)] bg-keyring-card p-4">
      <div className="text-sm text-keyring-gray">{label}</div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</div>
      <div className={`mt-2 text-sm ${deltaTone}`}>{delta}</div>
    </div>
  );
}
