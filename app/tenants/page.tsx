import { AppShell } from "@/components/layout/app-shell";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ModuleEmptyState } from "@/components/domain/module-empty-state";
import { makeNav } from "@/lib/nav";

export default function Page() {
  return (
    <AppShell title="Tenants" subtitle="Tenant Operations" navItems={makeNav("/tenants")}>
      <SectionHeader
        eyebrow="Tenant Operations"
        title="Tenants"
        description="Starter route for the tenants module."
      />
      <ModuleEmptyState
        title="Tenants module starter"
        description="This route is intentionally minimal so you can wire your real domain workflows without scraping decorative confetti off the floor."
        ctaLabel="Back to dashboard"
        ctaHref="/"
      />
    </AppShell>
  );
}
