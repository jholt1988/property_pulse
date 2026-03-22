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

type Property = { id: string; name: string; city?: string; state?: string; units?: Array<{ id: string; status?: string }> };

export default function Page() {
  const [rows, setRows] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
        const data = await apiClient<any>("/properties", { method: "GET", ...(token ? { token } : {}) });
        const list = Array.isArray(data) ? data : data?.data || data?.items || data?.properties || [];
        setRows(list);
      } catch (e: any) {
        setError(e?.message || "Failed to load properties");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const totalUnits = useMemo(() => rows.reduce((s, p) => s + (p.units?.length || 0), 0), [rows]);
  const activeUnits = useMemo(() => rows.reduce((s, p) => s + (p.units || []).filter((u) => String(u.status || "").toUpperCase().includes("ACTIVE") || String(u.status || "").toUpperCase().includes("LEASED")).length, 0), [rows]);

  return (
    <AppShell title="Properties" subtitle="Portfolio" navItems={makeNav("/properties")}>
      <SectionHeader
        eyebrow="Portfolio"
        title="Property Portfolio"
        description="Monitor portfolio inventory, coverage, and unit-level occupancy context."
      />

      {loading ? <ModuleLoadingState message="Loading portfolio..." /> : null}
      {error ? <ModuleErrorState message={error} /> : null}

      {!loading && !error && (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Properties" value={String(rows.length)} delta="Managed locations" />
            <MetricCard label="Total Units" value={String(totalUnits)} delta="Across all properties" />
            <MetricCard label="Active/Leased Units" value={String(activeUnits)} delta={totalUnits ? `${Math.round((activeUnits / totalUnits) * 100)}% occupancy proxy` : "No units yet"} deltaTone={activeUnits ? "text-keyring-success" : "text-keyring-gray"} />
          </section>

          <section>
            <TableToolbar left={<span className="text-sm text-keyring-gray">Portfolio inventory</span>} right={<StatusBadge tone={rows.length ? "success" : "warning"} label={rows.length ? "Portfolio loaded" : "No properties"} />} />
            <div className="overflow-hidden rounded-xl border border-[var(--kr-border-primary)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-keyring-gray">
                  <tr>
                    <th className="px-4 py-3 font-medium">Property</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Units</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 20).map((p) => {
                    const units = p.units?.length || 0;
                    return (
                      <tr key={p.id} className="border-t border-[var(--kr-border-divider)] text-slate-200">
                        <td className="px-4 py-3">{p.name}</td>
                        <td className="px-4 py-3 text-keyring-gray">{[p.city, p.state].filter(Boolean).join(", ") || "-"}</td>
                        <td className="px-4 py-3">{units}</td>
                        <td className="px-4 py-3">{units > 0 ? <StatusBadge tone="success" label="Configured" /> : <StatusBadge tone="warning" label="Needs unit setup" />}</td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 ? <tr><td className="px-4 py-4 text-keyring-gray" colSpan={4}>No properties found.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
