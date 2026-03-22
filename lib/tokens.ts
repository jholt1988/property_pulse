import { colorTokens, type ModuleKey } from "@/lib/tokens/color";

export const colors = colorTokens;
export type { ModuleKey };

export const moduleAccentClasses: Record<ModuleKey, string> = {
  core: "bg-keyring-core",
  inspect: "bg-keyring-inspect",
  lease: "bg-keyring-lease",
  finance: "bg-keyring-finance",
  ai: "bg-keyring-ai",
  tenants: "bg-keyring-tenants",
  properties: "bg-keyring-properties",
};
