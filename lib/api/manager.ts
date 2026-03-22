import { apiClient } from "./client";

export async function getDashboardMetrics(token?: string) {
  return apiClient<any>("/dashboard/metrics", { method: "GET", ...(token ? { token } : {}) });
}

export async function getManagerProperties(token?: string) {
  return apiClient<any>("/properties", { method: "GET", ...(token ? { token } : {}) });
}

export async function getManagerLeases(token?: string) {
  return apiClient<any>("/leases", { method: "GET", ...(token ? { token } : {}) });
}
