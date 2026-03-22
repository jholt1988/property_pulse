export function ModuleLoadingState({ message = "Loading..." }: { message?: string }) {
  return <div className="rounded border border-white/10 bg-white/5 p-4 text-sm text-slate-300">{message}</div>;
}
