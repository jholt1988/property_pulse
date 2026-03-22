import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  compact?: boolean;
}

export function Input({ className, compact = false, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/40",
        compact ? "h-10" : "h-12",
        className,
      )}
      {...props}
    />
  );
}

export function SearchInput({ placeholder = "Search...", compact = false }: { placeholder?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-slate-400", compact ? "h-10" : "h-12")}>
      <div className="h-4 w-4 rounded-full border border-slate-500" />
      <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder={placeholder} />
    </div>
  );
}
