export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
