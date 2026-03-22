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

type LeaseRow = {
  id: number;
  startDate: string;
  endDate: string;
  rentAmount?: number;
  status: string;
  tenant?: { username?: string };
  unit?: { name?: string; property?: { name?: string } | null };
};

const money = (n?: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);

export default function Page() {
  const [rows, setRows] = useState<LeaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
        const data = await apiClient<any>("/leases", { method: "GET", ...(token ? { token } : {}) });
        const list = Array.isArray(data) ? data : data?.data || data?.items || data?.leases || [];
        setRows(list);
      } catch (e: any) {
        setError(e?.message || "Failed to load lease operations");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const active = useMemo(() => rows.filter((r) => String(r.status).toUpperCase() === "ACTIVE"), [rows]);
  const endingSoon = useMemo(() => rows.filter((r) => {
    if (!r.endDate) return false;
    const ms = new Date(r.endDate).getTime() - Date.now();
    return ms > 0 && ms < 1000 * 60 * 60 * 24 * 60;
  }), [rows]);

  return (
    <AppShell title="Lease" subtitle="Leasing" navItems={makeNav("/lease")}>
      <SectionHeader
        eyebrow="Leasing"
        title="Lease Operations"
        description="Track lease status, renewal horizon, and contract performance across the portfolio."
      />

      {loading ? <ModuleLoadingState message="Loading lease data..." /> : null}
      {error ? <ModuleErrorState message={error} /> : null}

      {!loading && !error && (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Total Leases" value={String(rows.length)} delta="Portfolio contracts" />
            <MetricCard label="Active" value={String(active.length)} delta="Currently in force" deltaTone="text-keyring-success" />
            <MetricCard label="Ending < 60 days" value={String(endingSoon.length)} delta="Renewal pipeline" deltaTone={endingSoon.length ? "text-keyring-warning" : "text-keyring-gray"} />
            <MetricCard label="Monthly Rent (active)" value={money(active.reduce((s, r) => s + (r.rentAmount || 0), 0))} delta="Summed active lease rent" />
          </section>

          <section>
            <TableToolbar
              left={<span className="text-sm text-keyring-gray">Lease contract register</span>}
              right={<StatusBadge tone={endingSoon.length ? "warning" : "success"} label={endingSoon.length ? "Renewals approaching" : "No near-term renewals"} />}
            />
            <div className="overflow-hidden rounded-xl border border-[var(--kr-border-primary)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-keyring-gray">
                  <tr>
                    <th className="px-4 py-3 font-medium">Lease</th>
                    <th className="px-4 py-3 font-medium">Tenant</th>
                    <th className="px-4 py-3 font-medium">Unit</th>
                    <th className="px-4 py-3 font-medium">Term</th>
                    <th className="px-4 py-3 font-medium">Rent</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 30).map((r) => {
                    const status = String(r.status || "").toUpperCase();
                    return (
                      <tr key={r.id} className="border-t border-[var(--kr-border-divider)] text-slate-200">
                        <td className="px-4 py-3">#{r.id}</td>
                        <td className="px-4 py-3">{r.tenant?.username || "-"}</td>
                        <td className="px-4 py-3">{r.unit?.property?.name || "Property"} · {r.unit?.name || "Unit"}</td>
                        <td className="px-4 py-3 text-keyring-gray">{r.startDate ? new Date(r.startDate).toLocaleDateString() : "-"} → {r.endDate ? new Date(r.endDate).toLocaleDateString() : "-"}</td>
                        <td className="px-4 py-3">{money(r.rentAmount)}</td>
                        <td className="px-4 py-3">
                          {status === "ACTIVE" ? <StatusBadge tone="success" label={r.status} /> : status.includes("EXPIRE") || status.includes("PENDING") ? <StatusBadge tone="warning" label={r.status} /> : <StatusBadge tone="neutral" label={r.status} />}
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 ? <tr><td className="px-4 py-4 text-keyring-gray" colSpan={6}>No leases found.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
