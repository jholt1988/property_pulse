"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeader } from "@/components/dashboard/section-header";
import { MetricCard } from "@/components/data/metric-card";
import { TableToolbar } from "@/components/data/table-toolbar";
import { ModuleErrorState } from "@/components/domain/module-error-state";
import { ModuleLoadingState } from "@/components/domain/module-loading-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { makeNav } from "@/lib/nav";
import { apiClient } from "@/lib/api";

type UserRow = { id: string; username: string; role: string; lastLoginAt?: string | null };

export default function Page() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
        const data = await apiClient<any>("/users?take=200", { method: "GET", ...(token ? { token } : {}) });
        const list = Array.isArray(data) ? data : data?.data || data?.items || [];
        setRows(list);
      } catch (e: any) {
        setError(e?.message || "Failed to load tenant operations data");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const tenants = useMemo(() => rows.filter((u) => String(u.role).toUpperCase() === "TENANT"), [rows]);
  const managers = useMemo(() => rows.filter((u) => String(u.role).toUpperCase().includes("PROPERTY_MANAGER")), [rows]);
  const recentlyActive = useMemo(() => rows.filter((u) => u.lastLoginAt && Date.now() - new Date(u.lastLoginAt).getTime() < 1000 * 60 * 60 * 24 * 7), [rows]);

  return (
    <AppShell title="Tenants" subtitle="Tenant Operations" navItems={makeNav("/tenants")}>
      <SectionHeader
        eyebrow="Tenant Operations"
        title="Tenant & User Operations"
        description="Monitor account activity, tenant distribution, and operator coverage."
      />

      {loading ? <ModuleLoadingState message="Loading user operations..." /> : null}
      {error ? <ModuleErrorState message={error} /> : null}

      {!loading && !error && (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Total Users" value={String(rows.length)} delta="All account roles" />
            <MetricCard label="Tenants" value={String(tenants.length)} delta="Resident accounts" />
            <MetricCard label="Managers" value={String(managers.length)} delta="Operational owners" />
            <MetricCard label="Active (7d)" value={String(recentlyActive.length)} delta="Recent logins" deltaTone={recentlyActive.length ? "text-keyring-success" : "text-keyring-gray"} />
          </section>

          <section>
            <TableToolbar left={<span className="text-sm text-keyring-gray">User directory snapshot</span>} right={<StatusBadge tone={tenants.length ? "info" : "warning"} label={tenants.length ? "Tenant population available" : "No tenants found"} />} />
            <div className="overflow-hidden rounded-xl border border-[var(--kr-border-primary)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-keyring-gray">
                  <tr>
                    <th className="px-4 py-3 font-medium">Username</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Last Login</th>
                    <th className="px-4 py-3 font-medium">State</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 30).map((u) => {
                    const role = String(u.role).toUpperCase();
                    return (
                      <tr key={u.id} className="border-t border-[var(--kr-border-divider)] text-slate-200">
                        <td className="px-4 py-3">{u.username}</td>
                        <td className="px-4 py-3 text-keyring-gray">{u.role}</td>
                        <td className="px-4 py-3 text-keyring-gray">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}</td>
                        <td className="px-4 py-3">
                          {role === "TENANT" ? <StatusBadge tone="info" label="Tenant" /> : role.includes("PROPERTY_MANAGER") ? <StatusBadge tone="pending" label="Manager" /> : <StatusBadge tone="neutral" label={u.role} />}
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 ? <tr><td className="px-4 py-4 text-keyring-gray" colSpan={4}>No users found.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
