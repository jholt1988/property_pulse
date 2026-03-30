"use client";

import { AppShell } from "@/components/layout/app-shell";
import { RoleGuard } from "@/components/auth/role-guard";

const navItems = [
  { label: "Dashboard", href: "/manager/dashboard", module: "core" as const },
  { label: "Properties", href: "/manager/properties", module: "properties" as const },
  { label: "Leases", href: "/manager/leases", module: "lease" as const },
  { label: "Applications", href: "/manager/applications", module: "tenants" as const },
  { label: "Reporting", href: "/manager/reporting", module: "finance" as const },
  { label: "Users", href: "/manager/users", module: "tenants" as const },
  { label: "Billing Ops", href: "/manager/billing", module: "finance" as const },
  { label: "Rent AI", href: "/manager/rent-optimization", module: "ai" as const },
  { label: "QuickBooks", href: "/manager/quickbooks", module: "finance" as const },
  { label: "Documents", href: "/manager/documents", module: "properties" as const },
  { label: "Schedule", href: "/manager/schedule", module: "core" as const },
  { label: "E-sign", href: "/manager/esignature", module: "lease" as const },
  { label: "Msg Admin", href: "/manager/messaging", module: "tenants" as const },
  { label: "Inspections", href: "/manager/inspections", module: "inspect" as const },
  { label: "Audit", href: "/manager/audit", module: "ai" as const },
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["PROPERTY_MANAGER", "ADMIN"]}>
      <AppShell title="Manager Console" subtitle="Operations Control" navItems={navItems}>
        {children}
      </AppShell>
    </RoleGuard>
  );
}
