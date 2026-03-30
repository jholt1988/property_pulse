import { apiClient } from "./client";

export async function getMessagingStats(token?: string) {
  return apiClient<any>("/messaging/stats", { method: "GET", ...(token ? { token } : {}) });
}

export async function searchConversations(q: string, token?: string) {
  return apiClient<any>(`/messaging/search${q ? `?q=${encodeURIComponent(q)}` : ""}`, {
    method: "GET",
    ...(token ? { token } : {}),
  });
}

export async function getBulkCampaigns(token?: string) {
  return apiClient<any>("/messaging/bulk", { method: "GET", ...(token ? { token } : {}) });
}

export async function createBulkCampaign(payload: any, token?: string) {
  return apiClient<any>("/messaging/bulk", {
    method: "POST",
    body: JSON.stringify(payload),
    ...(token ? { token } : {}),
  });
}
