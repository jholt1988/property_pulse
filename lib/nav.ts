import { SidebarNavItem } from "@/components/navigation/sidebar";

export const makeNav = (active: SidebarNavItem["href"]): SidebarNavItem[] => [
  { label: "Dashboard", href: "/", module: "core", active: active === "/" },
  { label: "Inspect", href: "/inspect", module: "inspect", active: active === "/inspect" },
  { label: "Lease", href: "/lease", module: "lease", active: active === "/lease" },
  { label: "Finance", href: "/finance", module: "finance", active: active === "/finance" },
  { label: "AI", href: "/ai", module: "ai", active: active === "/ai" },
  { label: "Tenants", href: "/tenants", module: "tenants", active: active === "/tenants" },
  { label: "Properties", href: "/properties", module: "properties", active: active === "/properties" },
];
