import { apiClient } from "./client";

export async function getScheduleSummary(token?: string) {
  return apiClient<any>("/schedule/summary", { method: "GET", ...(token ? { token } : {}) });
}

export async function getScheduleToday(token?: string) {
  return apiClient<any>("/schedule/today", { method: "GET", ...(token ? { token } : {}) });
}

export async function getScheduleThisWeek(token?: string) {
  return apiClient<any>("/schedule/this-week", { method: "GET", ...(token ? { token } : {}) });
}

export async function getScheduleThisMonth(token?: string) {
  return apiClient<any>("/schedule/this-month", { method: "GET", ...(token ? { token } : {}) });
}

export async function getScheduleExpirations(token?: string) {
  return apiClient<any>("/schedule/expirations", { method: "GET", ...(token ? { token } : {}) });
}
