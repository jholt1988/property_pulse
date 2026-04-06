import { apiClient } from "./client";

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
  return apiClient<any>("/dashboard/action-intents", { method: "GET", ...(token ? { token } : {}) });
}

export async function resolveActionIntent(id: string, action: string, token?: string) {
  return apiClient<any>(`/dashboard/action-intents/${id}/resolve`, { 
    method: "PATCH", 
    body: { action },
    ...(token ? { token } : {}) 
  });
}

export async function getManagerLeases(token?: string) {
  return apiClient<any>("/leases", { method: "GET", ...(token ? { token } : {}) });
}
