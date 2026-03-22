"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function RightDrawerShell({
  open,
  title,
  children,
  onClose,
  className,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45" onClick={onClose}>
      <aside
        className={cn("h-full w-full max-w-xl border-l border-[var(--kr-border-primary)] bg-keyring-panel p-5 shadow-2xl", className)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
          <button className="rounded border border-[var(--kr-border-primary)] px-2 py-1 text-xs text-keyring-gray hover:bg-white/5" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="h-[calc(100%-3rem)] overflow-auto">{children}</div>
      </aside>
    </div>
  );
}
