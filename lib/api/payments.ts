import { apiClient } from "./client";

export type Invoice = { id: number; amount: number; dueDate: string; status: string; description?: string };
export type Payment = { id: number; amount: number; paymentDate: string; status: string };
export type PaymentMethod = { id: number; type: string; provider: string; brand?: string; last4?: string; expMonth?: number; expYear?: number };

export async function getInvoices(token?: string) {
  return apiClient<any>("/payments/invoices", { method: "GET", ...(token ? { token } : {}) });
}

export async function getPaymentHistory(token?: string) {
  return apiClient<any>("/payments/history", { method: "GET", ...(token ? { token } : {}) });
}

export async function getPaymentMethods(token?: string) {
  return apiClient<any>("/payments/payment-methods", { method: "GET", ...(token ? { token } : {}) });
}

export async function getMyLease(token?: string) {
  return apiClient<any>("/leases/my-lease", { method: "GET", ...(token ? { token } : {}) });
}

export async function submitTenantNotice(
  leaseId: number,
  payload: { type: "MOVE_OUT" | "RENT_INCREASE" | "OTHER"; moveOutAt: string; message?: string },
  token?: string,
) {
  return apiClient<any>(`/leases/${leaseId}/tenant-notices`, {
    method: "POST",
    body: JSON.stringify(payload),
    ...(token ? { token } : {}),
  });
}
