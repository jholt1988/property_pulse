import { apiClient } from "./client";

export type TenantDashboardData = {
  nextRentPayment?: { amount: number; dueDate: string; isPaid: boolean };
  maintenanceRequests: { total: number; pending: number; inProgress: number; completed: number; urgent: number };
  lease?: { property: string; unit: string; status: string; monthlyRent: number; endDate: string };
  recentActivity: Array<{ id: number; type: string; title: string; date: string }>;
};

export async function getTenantDashboard(token?: string) {
  return apiClient<Partial<TenantDashboardData>>("/tenant/dashboard", {
    method: "GET",
    ...(token ? { token } : {}),
  });
}

export type MaintenanceRequest = {
  id: string | number;
  title: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
  createdAt: string;
};

export async function getMaintenanceRequests(token?: string) {
  return apiClient<any>("/maintenance", {
    method: "GET",
    ...(token ? { token } : {}),
  });
}

export async function createMaintenanceRequest(
  payload: { title: string; description: string; priority: MaintenanceRequest["priority"] },
  token?: string,
) {
  return apiClient<MaintenanceRequest>("/maintenance", {
    method: "POST",
    body: JSON.stringify(payload),
    ...(token ? { token } : {}),
  });
}
