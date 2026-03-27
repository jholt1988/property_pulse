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

const toArray = <T,>(data: any): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data?.items)) return data.items as T[];
  if (Array.isArray(data?.requests)) return data.requests as T[];
  if (Array.isArray(data?.data)) return data.data as T[];
  return [];
};

const normalizeRequest = (item: any): MaintenanceRequest => ({
  id: item?.id,
  title: String(item?.title ?? "Maintenance request"),
  description: String(item?.description ?? ""),
  status: String(item?.status ?? "PENDING") as MaintenanceRequest["status"],
  priority: String(item?.priority ?? "MEDIUM") as MaintenanceRequest["priority"],
  createdAt: String(item?.createdAt ?? item?.updatedAt ?? new Date().toISOString()),
});

export async function getMaintenanceRequests(token?: string): Promise<MaintenanceRequest[]> {
  const data = await apiClient<any>("/maintenance", {
    method: "GET",
    ...(token ? { token } : {}),
  });
  return toArray<any>(data).map(normalizeRequest);
}

export async function createMaintenanceRequest(
  payload: { title: string; description: string; priority: MaintenanceRequest["priority"] },
  token?: string,
): Promise<MaintenanceRequest> {
  const data = await apiClient<any>("/maintenance", {
    method: "POST",
    body: JSON.stringify(payload),
    ...(token ? { token } : {}),
  });
  return normalizeRequest(data?.request ?? data?.item ?? data);
}
