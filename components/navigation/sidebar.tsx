"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/logo-mark";
import { ModuleKey, moduleAccentClasses } from "@/lib/tokens";
import { cn } from "@/lib/utils";

export interface SidebarNavItem {
  label: string;
  href: string;
  module: ModuleKey;
  active?: boolean;
}

export function AppSidebar({ items }: { items: SidebarNavItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="border-r border-[var(--kr-border-divider)] bg-keyring-navy px-4 py-5">
      <div className="flex items-center gap-3 px-3 py-2">
        <LogoMark />
        <div>
          <div className="font-display text-xl font-semibold tracking-tight text-white">Keyring OS</div>
          <div className="text-xs text-keyring-gray">Control Plane</div>
        </div>
      </div>
      <div className="mt-6 space-y-1">
        {items.map((item) => {
          const isActive = item.active ?? (pathname === item.href || pathname.startsWith(`${item.href}/`));
          return <SidebarItem key={item.href} {...item} active={isActive} />;
        })}
      </div>
    </aside>
  );
}

function SidebarItem({ label, href, module, active }: SidebarNavItem) {
  return (
    <Link
      href={href}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm transition",
        active ? "border border-[var(--kr-border-primary)] bg-white/10 text-white" : "text-keyring-gray hover:bg-white/5 hover:text-white",
      )}
    >
      <div className={cn("h-2.5 w-2.5 rounded-full", moduleAccentClasses[module])} />
      <span>{label}</span>
    </Link>
  );
}
