import { apiClient } from "./client";

export async function getRentalApplications(token?: string) {
  return apiClient<any>("/rental-applications", { method: "GET", ...(token ? { token } : {}) });
}

export async function getReporting(reportType: string, query: string, token?: string) {
  return apiClient<any>(`/reporting/${reportType}${query ? `?${query}` : ""}`, { method: "GET", ...(token ? { token } : {}) });
}

export async function getUsers(query: string, token?: string) {
  return apiClient<any>(`/users${query ? `?${query}` : ""}`, { method: "GET", ...(token ? { token } : {}) });
}

export async function createUser(payload: any, token?: string) {
  return apiClient<any>("/users", { method: "POST", body: JSON.stringify(payload), ...(token ? { token } : {}) });
}

export async function updateUser(id: number, payload: any, token?: string) {
  return apiClient<any>(`/users/${id}`, { method: "PUT", body: JSON.stringify(payload), ...(token ? { token } : {}) });
}

export async function deleteUser(id: number, token?: string) {
  return apiClient<any>(`/users/${id}`, { method: "DELETE", ...(token ? { token } : {}) });
}

export async function getSecurityEvents(limit = 200, token?: string) {
  return apiClient<any>(`/security-events?limit=${limit}`, { method: "GET", ...(token ? { token } : {}) });
}
