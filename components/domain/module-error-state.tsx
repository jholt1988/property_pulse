export function ModuleErrorState({ message }: { message: string }) {
  return <div className="rounded border border-red-400/40 bg-red-900/20 p-4 text-sm text-red-200">{message}</div>;
}
