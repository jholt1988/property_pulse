"use client";

import { useRouter } from "next/navigation";
import { SearchInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    document.cookie = "session_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    router.push("/login");
  };

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--kr-border-divider)] bg-keyring-navy/90 px-8 py-4 backdrop-blur-xl">
      <div>
        {subtitle ? <div className="text-xs uppercase tracking-[0.22em] text-keyring-gray">{subtitle}</div> : null}
        <div className="font-display mt-1 text-lg font-semibold tracking-tight text-white">{title}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-72">
          <SearchInput placeholder="Search properties, tenants, tasks..." compact />
        </div>
        <Button variant="secondary" size="sm">Export</Button>
        <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  );
}
