import { apiClient } from "./client";

export type PortfolioHeatmapRow = {
  propertyId: string;
  propertyName: string;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  collectionRate: number;
  maintenanceHealth: number;
  compositeScore: number;
  tier: "HEALTHY" | "WATCH" | "CRITICAL";
};

export type OpexAnomaly = {
  propertyId: string;
  propertyName: string;
  trailingMonthlyAvg: number;
  currentMonthTotal: number;
  deviationPercent: number;
  direction: "ABOVE" | "BELOW";
  severity: "WARNING" | "CRITICAL";
};

export type ManagerActionIntent = {
  id: string;
  type: string;
  description: string;
  status: string;
  priority: "HIGH" | "MEDIUM" | "LOW" | string;
  raw?: Record<string, unknown>;
  createdAt: string;
};

export type SeasonalPricingMatrix = {
  unitId: string;
  propertyId: string;
  unitName: string;
  baseRent: number;
  generatedAt: string;
  options: Array<{
    termMonths: number;
    targetStartMonth: number;
    targetStartMonthLabel: string;
    monthlyRent: number;
    seasonalAdjustmentPercent: number;
    recommended: boolean;
    reason: string;
  }>;
};

export async function getDashboardMetrics(token?: string) {
  return apiClient<any>("/dashboard/metrics", { method: "GET", ...(token ? { token } : {}) });
}

export async function getManagerProperties(token?: string) {
  return apiClient<any>("/properties", { method: "GET", ...(token ? { token } : {}) });
}

export async function getPropertyLocations(token?: string) {
  return apiClient<any>("/dashboard/property-locations", { method: "GET", ...(token ? { token } : {}) });
}

export async function getActionIntents(token?: string) {
  return apiClient<{ intents: ManagerActionIntent[] }>("/dashboard/action-intents", { method: "GET", ...(token ? { token } : {}) });
}

export async function resolveActionIntent(id: string, action: string, token?: string) {
  return apiClient<any>(`/dashboard/action-intents/${id}/resolve`, { 
    method: "PATCH", 
    body: JSON.stringify({ action }),
    ...(token ? { token } : {}) 
  });
}

export async function getManagerLeases(token?: string) {
  return apiClient<any>("/leases", { method: "GET", ...(token ? { token } : {}) });
}

export async function getPortfolioHeatmap(token?: string) {
  return apiClient<PortfolioHeatmapRow[]>("/reporting/analytics/heatmap", { method: "GET", ...(token ? { token } : {}) });
}

export async function getOpexAnomalies(token?: string) {
  return apiClient<OpexAnomaly[]>("/reporting/analytics/opex-anomalies", { method: "GET", ...(token ? { token } : {}) });
}

export async function getSeasonalPricingMatrix(unitId: string, baseRent?: number, token?: string) {
  const suffix = baseRent ? `?baseRent=${encodeURIComponent(String(baseRent))}` : "";
  return apiClient<SeasonalPricingMatrix>(`/rent-recommendations/seasonal-pricing/${unitId}${suffix}`, {
    method: "GET",
    ...(token ? { token } : {}),
  });
}
