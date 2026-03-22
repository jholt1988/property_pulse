import { AppShell } from "@/components/layout/app-shell";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ModuleEmptyState } from "@/components/domain/module-empty-state";
import { makeNav } from "@/lib/nav";

export default function Page() {
  return (
    <AppShell title="Inspect" subtitle="Inspections" navItems={makeNav("/inspect")}>
      <SectionHeader
        eyebrow="Inspections"
        title="Inspect"
        description="Starter route for the inspect module."
      />
      <ModuleEmptyState
        title="Inspect module starter"
        description="This route is intentionally minimal so you can wire your real domain workflows without scraping decorative confetti off the floor."
        ctaLabel="Back to dashboard"
        ctaHref="/"
      />
    </AppShell>
  );
}
