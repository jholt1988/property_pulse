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

type Invoice = { id: number; amount: number; status: string; dueDate: string; leaseId?: string | number };

type DashboardMetrics = {
  financials?: { monthlyRevenue?: number; collectedThisMonth?: number; overdueAmount?: number };
};

const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

export default function Page() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
        const [m, i] = await Promise.all([
          apiClient<DashboardMetrics>("/dashboard/metrics", { method: "GET", ...(token ? { token } : {}) }),
          apiClient<any>("/payments/invoices", { method: "GET", ...(token ? { token } : {}) }),
        ]);
        setMetrics(m);
        const rows = Array.isArray(i) ? i : i?.invoices || i?.data || i?.items || [];
        setInvoices(rows);
      } catch (e: any) {
        setError(e?.message || "Failed to load finance module");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const overdue = useMemo(() => invoices.filter((x) => String(x.status).toUpperCase().includes("OVERDUE")), [invoices]);
  const open = useMemo(() => invoices.filter((x) => String(x.status).toUpperCase() !== "PAID"), [invoices]);
  const openTotal = useMemo(() => open.reduce((s, x) => s + (x.amount || 0), 0), [open]);

  return (
    <AppShell title="Finance" subtitle="Collections & Performance" navItems={makeNav("/finance")}>
      <SectionHeader
        eyebrow="Finance"
        title="Finance Operations"
        description="Track portfolio collections, overdue exposure, and invoice-level risk in one workspace."
      />

      {loading ? <ModuleLoadingState message="Loading financial telemetry..." /> : null}
      {error ? <ModuleErrorState message={error} /> : null}

      {!loading && !error && (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Monthly Revenue" value={money(metrics?.financials?.monthlyRevenue || 0)} delta="Portfolio aggregate" />
            <MetricCard label="Collected" value={money(metrics?.financials?.collectedThisMonth || 0)} delta="Current month" deltaTone="text-keyring-success" />
            <MetricCard label="Open Balance" value={money(openTotal)} delta={`${open.length} open invoice(s)`} deltaTone={open.length ? "text-keyring-warning" : "text-keyring-gray"} />
            <MetricCard label="Overdue" value={money(metrics?.financials?.overdueAmount || 0)} delta={`${overdue.length} overdue`} deltaTone={overdue.length ? "text-keyring-error" : "text-keyring-gray"} />
          </section>

          <section>
            <TableToolbar
              left={<span className="text-sm text-keyring-gray">Open and overdue invoices</span>}
              right={<StatusBadge tone={overdue.length ? "error" : "success"} label={overdue.length ? "Overdue present" : "No overdue"} />}
            />
            <div className="overflow-hidden rounded-xl border border-[var(--kr-border-primary)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-keyring-gray">
                  <tr>
                    <th className="px-4 py-3 font-medium">Invoice</th>
                    <th className="px-4 py-3 font-medium">Lease</th>
                    <th className="px-4 py-3 font-medium">Due</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {open.slice(0, 20).map((inv) => (
                    <tr key={inv.id} className="border-t border-[var(--kr-border-divider)] text-slate-200">
                      <td className="px-4 py-3">#{inv.id}</td>
                      <td className="px-4 py-3">{inv.leaseId ?? "-"}</td>
                      <td className="px-4 py-3 text-keyring-gray">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-3">{money(inv.amount || 0)}</td>
                      <td className="px-4 py-3">
                        {String(inv.status).toUpperCase().includes("OVERDUE") ? (
                          <StatusBadge tone="error" label={inv.status} />
                        ) : String(inv.status).toUpperCase() === "PAID" ? (
                          <StatusBadge tone="success" label={inv.status} />
                        ) : (
                          <StatusBadge tone="pending" label={inv.status} />
                        )}
                      </td>
                    </tr>
                  ))}
                  {open.length === 0 ? (
                    <tr>
                      <td className="px-4 py-4 text-keyring-gray" colSpan={5}>No open invoices.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
