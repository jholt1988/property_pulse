import { apiClient } from "./client";

export async function getRentRecommendationStats(token?: string) {
  return apiClient<any>("/rent-recommendations/stats", { method: "GET", ...(token ? { token } : {}) });
}

export async function getPendingRentRecommendations(token?: string) {
  return apiClient<any>("/rent-recommendations/pending", { method: "GET", ...(token ? { token } : {}) });
}

export async function getRecentRentRecommendations(token?: string) {
  return apiClient<any>("/rent-recommendations/recent", { method: "GET", ...(token ? { token } : {}) });
}

export async function generateRentRecommendations(payload: any, token?: string) {
  return apiClient<any>("/rent-recommendations/generate", {
    method: "POST",
    body: JSON.stringify(payload),
    ...(token ? { token } : {}),
  });
}
