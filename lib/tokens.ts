export const colors = {
  brand: {
    core: "#3B82F6",
    navy: "#0B1220",
    white: "#FFFFFF",
    gray: "#94A3B8",
    panel: "#111827",
    card: "#1F2937",
  },
  module: {
    core: "#3B82F6",
    inspect: "#14B8A6",
    lease: "#8B5CF6",
    finance: "#10B981",
    ai: "#22D3EE",
    tenants: "#F59E0B",
    properties: "#60A5FA",
  },
  semantic: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    pending: "#A78BFA",
  },
} as const;

export type ModuleKey = keyof typeof colors.module;

export const moduleAccentClasses: Record<ModuleKey, string> = {
  core: "bg-blue-500",
  inspect: "bg-teal-500",
  lease: "bg-violet-500",
  finance: "bg-emerald-500",
  ai: "bg-cyan-400",
  tenants: "bg-amber-500",
  properties: "bg-sky-400",
};
