import { apiClient } from "./client";

export async function getInspectionRequests(token?: string) {
  return apiClient<any>("/inspections/requests", { method: "GET", ...(token ? { token } : {}) });
}

export async function decideInspectionRequest(id: number | string, payload: { decision: "APPROVE" | "REJECT"; notes?: string }, token?: string) {
  return apiClient<any>(`/inspections/requests/${id}/decision`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    ...(token ? { token } : {}),
  });
}

export async function createEstimateFromInspection(id: number | string, token?: string) {
  return apiClient<any>(`/inspections/${id}/estimate`, { method: "POST", ...(token ? { token } : {}) });
}

export async function getInspectionEstimates(id: number | string, token?: string) {
  return apiClient<any>(`/inspections/${id}/estimates`, { method: "GET", ...(token ? { token } : {}) });
}
