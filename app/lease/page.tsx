import { AppShell } from "@/components/layout/app-shell";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ModuleEmptyState } from "@/components/domain/module-empty-state";
import { makeNav } from "@/lib/nav";

export default function Page() {
  return (
    <AppShell title="Lease" subtitle="Leasing" navItems={makeNav("/lease")}>
      <SectionHeader
        eyebrow="Leasing"
        title="Lease"
        description="Starter route for the lease module."
      />
      <ModuleEmptyState
        title="Lease module starter"
        description="This route is intentionally minimal so you can wire your real domain workflows without scraping decorative confetti off the floor."
        ctaLabel="Back to dashboard"
        ctaHref="/"
      />
    </AppShell>
  );
}
