import { apiClient } from "./client";

export async function getQuickBooksStatus(token?: string) {
  return apiClient<any>("/quickbooks/status", { method: "GET", ...(token ? { token } : {}) });
}

export async function getQuickBooksAuthUrl(token?: string) {
  return apiClient<any>("/quickbooks/auth-url", { method: "GET", ...(token ? { token } : {}) });
}

export async function testQuickBooksConnection(token?: string) {
  return apiClient<any>("/quickbooks/test-connection", { method: "GET", ...(token ? { token } : {}) });
}

export async function syncQuickBooks(token?: string) {
  return apiClient<any>("/quickbooks/sync", { method: "POST", ...(token ? { token } : {}) });
}

export async function disconnectQuickBooks(token?: string) {
  return apiClient<any>("/quickbooks/disconnect", { method: "POST", ...(token ? { token } : {}) });
}
