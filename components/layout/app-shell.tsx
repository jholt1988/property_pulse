import { ReactNode } from "react";
import { AppSidebar, SidebarNavItem } from "@/components/navigation/sidebar";
import { TopBar } from "@/components/navigation/top-bar";

export function AppShell({
  title,
  subtitle,
  navItems,
  children,
}: {
  title: string;
  subtitle?: string;
  navItems: SidebarNavItem[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-keyring-navy text-keyring-white">
      <div className="grid min-h-screen grid-cols-[280px_1fr]">
        <AppSidebar items={navItems} />
        <main className="overflow-auto">
          <TopBar title={title} subtitle={subtitle} />
          <div className="space-y-8 p-8 md:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
