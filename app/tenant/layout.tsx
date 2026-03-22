"use client";

import { AppShell } from "@/components/layout/app-shell";
import { RoleGuard } from "@/components/auth/role-guard";

const navItems = [
  { label: "Dashboard", href: "/tenant/dashboard", module: "core" as const },
  { label: "Maintenance", href: "/tenant/maintenance", module: "inspect" as const },
  { label: "Payments", href: "/tenant/payments", module: "finance" as const },
  { label: "My Lease", href: "/tenant/lease", module: "lease" as const },
  { label: "Inspections", href: "/tenant/inspections", module: "inspect" as const },
  { label: "Messages", href: "/tenant/messages", module: "tenants" as const },
  { label: "Application", href: "/tenant/application", module: "properties" as const },
];

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["TENANT", "ADMIN"]}>
      <AppShell title="Tenant Portal" subtitle="Resident Workspace" navItems={navItems}>
        {children}
      </AppShell>
    </RoleGuard>
  );
}
