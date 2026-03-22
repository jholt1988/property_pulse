"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeader } from "@/components/dashboard/section-header";
import { MetricCard } from "@/components/data/metric-card";
import { AIInsightCard } from "@/components/ai/ai-insight-card";
import { TableToolbar } from "@/components/data/table-toolbar";
import { StatusBadge } from "@/components/ui/status-badge";
import { ModuleErrorState } from "@/components/domain/module-error-state";
import { ModuleLoadingState } from "@/components/domain/module-loading-state";
import { makeNav } from "@/lib/nav";
import { apiClient } from "@/lib/api";

type SecurityEvent = {
  id: number;
  type: string;
  success: boolean;
  createdAt: string;
};

export default function Page() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
        const data = await apiClient<any>("/security-events?limit=30", { method: "GET", ...(token ? { token } : {}) });
        const rows = Array.isArray(data) ? data : data?.data || data?.items || [];
        setEvents(rows);
      } catch (e: any) {
        setError(e?.message || "Failed to load AI activity stream");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const aiEvents = events.filter((e) => String(e.type || "").includes("PROPERTY_OS") || String(e.type || "").includes("AI"));
  const success = aiEvents.filter((e) => e.success).length;
  const fail = aiEvents.filter((e) => !e.success).length;

  return (
    <AppShell title="AI" subtitle="Automation" navItems={makeNav("/ai")}>
      <SectionHeader
        eyebrow="Automation"
        title="AI Command Center"
        description="Monitor AI-driven actions, approvals, and execution reliability across the portfolio."
      />

      {loading ? <ModuleLoadingState message="Loading AI telemetry..." /> : null}
      {error ? <ModuleErrorState message={error} /> : null}

      {!loading && !error && (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard label="AI Events" value={String(aiEvents.length)} delta="Last 30 events" />
            <MetricCard label="Successful Runs" value={String(success)} delta={`${aiEvents.length ? Math.round((success / aiEvents.length) * 100) : 0}% success`} deltaTone="text-keyring-success" />
            <MetricCard label="Failed Runs" value={String(fail)} delta="Requires human review" deltaTone={fail > 0 ? "text-keyring-error" : "text-keyring-gray"} />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <AIInsightCard
              title="Delinquency Follow-up Proposal"
              description="AI suggests scheduling follow-up reminders for leases with overdue balances and high historical recovery after day 5."
              confidence="High confidence"
            />
            <AIInsightCard
              title="Maintenance Escalation Routing"
              description="AI detected recurring high-priority plumbing requests in one building and recommends temporary vendor reassignment."
              confidence="Medium confidence"
            />
          </section>

          <section>
            <TableToolbar
              left={<span className="text-sm text-keyring-gray">Recent AI / Property OS events</span>}
              right={<StatusBadge tone={fail > 0 ? "warning" : "success"} label={fail > 0 ? "Attention needed" : "Healthy"} />}
            />
            <div className="overflow-hidden rounded-xl border border-[var(--kr-border-primary)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-keyring-gray">
                  <tr>
                    <th className="px-4 py-3 font-medium">Event</th>
                    <th className="px-4 py-3 font-medium">Result</th>
                    <th className="px-4 py-3 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {aiEvents.slice(0, 12).map((e) => (
                    <tr key={e.id} className="border-t border-[var(--kr-border-divider)] text-slate-200">
                      <td className="px-4 py-3">{e.type}</td>
                      <td className="px-4 py-3">{e.success ? <StatusBadge tone="success" label="Success" /> : <StatusBadge tone="error" label="Failure" />}</td>
                      <td className="px-4 py-3 text-keyring-gray">{e.createdAt ? new Date(e.createdAt).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                  {aiEvents.length === 0 ? (
                    <tr>
                      <td className="px-4 py-4 text-keyring-gray" colSpan={3}>No AI events yet.</td>
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
