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

type Inspection = { id: number; type: string; status: string; scheduledDate?: string; unit?: { name?: string; property?: { name?: string } } };

const human = (s: string) => String(s || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());

export default function Page() {
  const [rows, setRows] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
        const data = await apiClient<any>("/inspections", { method: "GET", ...(token ? { token } : {}) });
        const list = Array.isArray(data) ? data : data?.data || data?.items || data?.inspections || [];
        setRows(list);
      } catch (e: any) {
        setError(e?.message || "Failed to load inspection queue");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const pending = useMemo(() => rows.filter((r) => String(r.status).includes("SCHEDULED") || String(r.status).includes("PENDING")), [rows]);
  const inProgress = useMemo(() => rows.filter((r) => String(r.status).includes("IN_PROGRESS")), [rows]);
  const completed = useMemo(() => rows.filter((r) => String(r.status).includes("COMPLETED")), [rows]);

  return (
    <AppShell title="Inspect" subtitle="Inspections" navItems={makeNav("/inspect")}>
      <SectionHeader
        eyebrow="Inspections"
        title="Inspection Operations"
        description="Track scheduled, active, and completed inspections across properties and units."
      />

      {loading ? <ModuleLoadingState message="Loading inspections..." /> : null}
      {error ? <ModuleErrorState message={error} /> : null}

      {!loading && !error && (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Total Inspections" value={String(rows.length)} delta="Current visible queue" />
            <MetricCard label="Scheduled / Pending" value={String(pending.length)} delta="Awaiting execution" deltaTone="text-keyring-warning" />
            <MetricCard label="In Progress" value={String(inProgress.length)} delta="Active field work" deltaTone="text-keyring-info" />
            <MetricCard label="Completed" value={String(completed.length)} delta="Closed and archived" deltaTone="text-keyring-success" />
          </section>

          <section>
            <TableToolbar left={<span className="text-sm text-keyring-gray">Inspection queue</span>} right={<StatusBadge tone={pending.length ? "warning" : "success"} label={pending.length ? "Work pending" : "On track"} />} />
            <div className="overflow-hidden rounded-xl border border-[var(--kr-border-primary)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-keyring-gray">
                  <tr>
                    <th className="px-4 py-3 font-medium">Inspection</th>
                    <th className="px-4 py-3 font-medium">Property / Unit</th>
                    <th className="px-4 py-3 font-medium">Scheduled</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 20).map((r) => (
                    <tr key={r.id} className="border-t border-[var(--kr-border-divider)] text-slate-200">
                      <td className="px-4 py-3">#{r.id} · {human(r.type)}</td>
                      <td className="px-4 py-3">{r.unit?.property?.name || "Property"} · {r.unit?.name || "Unit"}</td>
                      <td className="px-4 py-3 text-keyring-gray">{r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString() : "TBD"}</td>
                      <td className="px-4 py-3">
                        {String(r.status).includes("COMPLETED") ? <StatusBadge tone="success" label={human(r.status)} /> :
                         String(r.status).includes("IN_PROGRESS") ? <StatusBadge tone="info" label={human(r.status)} /> :
                         <StatusBadge tone="pending" label={human(r.status)} />}
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 ? <tr><td className="px-4 py-4 text-keyring-gray" colSpan={4}>No inspections found.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
