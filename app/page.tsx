import { AppShell } from "@/components/layout/app-shell";
import { Panel } from "@/components/layout/panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { MetricCard } from "@/components/data/metric-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, AIChip } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PropertyTable } from "@/components/data/data-table";
import { AIInsightCard } from "@/components/ai/ai-insight-card";
import { ApprovalRow } from "@/components/ai/approval-row";
import { makeNav } from "@/lib/nav";

const stats = [
  { label: "Occupancy", value: "92.3%", delta: "+1.8%", deltaTone: "text-emerald-400" },
  { label: "Rent Collected", value: "$156,420", delta: "+23.6%", deltaTone: "text-emerald-400" },
  { label: "Open Work Orders", value: "18", delta: "-4", deltaTone: "text-cyan-400" },
  { label: "Risk Signals", value: "7", delta: "+2", deltaTone: "text-amber-400" },
];

const rows = [
  { property: "Building W", occupancy: "96%", risk: "Low" as const, status: "Stable" },
  { property: "Maple Terrace", occupancy: "88%", risk: "Moderate" as const, status: "Watch" },
  { property: "River Point", occupancy: "71%", risk: "Elevated" as const, status: "Action" },
];

export default function Page() {
  return (
    <AppShell title="Keyring OS Dashboard" subtitle="React / Tailwind Starter" navItems={makeNav("/")}>
      <SectionHeader
        eyebrow="Dashboard"
        title="The Operating System for Real Estate"
        description="Automate operations. Understand properties. Deploy intelligence. This starter gives you the shell, not the illusion of completeness."
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <Panel className="p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-sm uppercase tracking-[0.18em] text-slate-400">Hero / Product Shell</div>
              <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight">
                Real-estate intelligence, minus the clown shoes.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
                A dashboard language for inspections, leasing, finance, and AI orchestration.
              </p>
            </div>
            <Badge tone="info">System Healthy</Badge>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <MetricCard key={stat.label} {...stat} />
            ))}
          </div>
        </Panel>

        <Panel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.18em] text-slate-400">Approval Queue</div>
              <div className="mt-2 text-xl font-semibold">Human Review Gate</div>
            </div>
            <AIChip>3 Pending</AIChip>
          </div>

          <div className="mt-5 space-y-3">
            <ApprovalRow title="Approve HVAC estimate" confidence="91% confidence" module="inspect" />
            <ApprovalRow title="Escalate delinquency workflow" confidence="84% confidence" module="finance" />
            <ApprovalRow title="Send lease renewal sequence" confidence="88% confidence" module="lease" />
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader title="Command Input" subtitle="Search, navigate, or invoke automations" />
          <CardContent>
            <SearchInput placeholder="Search properties, workflows, tenants..." />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm">Run AI Check</Button>
              <Button variant="secondary" size="sm">Open Command Bar</Button>
              <Button variant="ghost" size="sm">Export</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Status & Feedback" subtitle="System semantics and operational feedback" />
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge tone="success">Collected</Badge>
              <Badge tone="warning">Review Needed</Badge>
              <Badge tone="error">Overdue</Badge>
              <Badge tone="pending">Queued</Badge>
            </div>
            <div className="mt-4">
              <ProgressBar value={68} label="Portfolio Sync" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Panel className="p-6">
        <div className="text-sm uppercase tracking-[0.18em] text-slate-400">Portfolio Table</div>
        <div className="mt-2 text-2xl font-semibold">Property Health</div>
        <div className="mt-5">
          <PropertyTable rows={rows} />
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <AIInsightCard
          title="Lease renewal timing is favorable"
          description="Model detected a 14-day window with lower churn probability based on recent response behavior and comparable unit velocity."
          confidence="89% confidence"
        />
        <AIInsightCard
          title="Maintenance cluster emerging"
          description="Three HVAC-related work orders suggest a system-level issue, not isolated tenant complaints. The gremlin appears systemic."
          confidence="93% confidence"
        />
      </div>
    </AppShell>
  );
}
