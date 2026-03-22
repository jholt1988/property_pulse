export const colorTokens = {
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
  ui: {
    borderPrimary: "rgba(148,163,184,0.16)",
    borderDivider: "rgba(255,255,255,0.06)",
    textPrimary: "#FFFFFF",
    textSecondary: "#94A3B8",
    bgBase: "#0B1220",
    bgPanel: "#111827",
    bgCard: "#1F2937",
  },
} as const;

export type ModuleKey = keyof typeof colorTokens.module;
