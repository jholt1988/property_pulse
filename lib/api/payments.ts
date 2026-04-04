import { apiClient } from "./client";

export type Invoice = { id: number; amount: number; dueDate: string; status: string; description?: string };
export type Payment = { id: number; amount: number; paymentDate: string; status: string };
export type PaymentMethod = { id: number; type: string; provider: string; brand?: string; last4?: string; expMonth?: number; expYear?: number };

const toArray = <T,>(data: any, keys: string[]): T[] => {
  if (Array.isArray(data)) return data as T[];
  for (const k of keys) {
    if (Array.isArray(data?.[k])) return data[k] as T[];
  }
  return [];
};

const normalizeInvoice = (item: any): Invoice => ({
  id: Number(item?.id ?? 0),
  amount: Number(item?.amount ?? 0),
  dueDate: String(item?.dueDate ?? item?.dueAt ?? item?.createdAt ?? new Date().toISOString()),
  status: String(item?.status ?? "UNKNOWN"),
  description: item?.description ?? undefined,
});

const normalizePayment = (item: any): Payment => ({
  id: Number(item?.id ?? 0),
  amount: Number(item?.amount ?? 0),
  paymentDate: String(item?.paymentDate ?? item?.createdAt ?? item?.date ?? new Date().toISOString()),
  status: String(item?.status ?? "COMPLETED"),
});

const normalizeMethod = (item: any): PaymentMethod => ({
  id: Number(item?.id ?? 0),
  type: String(item?.type ?? "CARD"),
  provider: String(item?.provider ?? "UNKNOWN"),
  brand: item?.brand ?? undefined,
  last4: item?.last4 ?? undefined,
  expMonth: item?.expMonth ?? undefined,
  expYear: item?.expYear ?? undefined,
});

export async function getInvoices(token?: string): Promise<Invoice[]> {
  const data = await apiClient<any>("/payments/invoices", { method: "GET", ...(token ? { token } : {}) });
  return toArray<any>(data, ["invoices", "items", "data"]).map(normalizeInvoice);
}

export async function getPaymentHistory(token?: string): Promise<Payment[]> {
  try {
    const data = await apiClient<any>("/payments/history", { method: "GET", ...(token ? { token } : {}) });
    return toArray<any>(data, ["payments", "items", "data"]).map(normalizePayment);
  } catch {
    const data = await apiClient<any>("/payments", { method: "GET", ...(token ? { token } : {}) });
    return toArray<any>(data, ["payments", "items", "data"]).map(normalizePayment);
  }
}

export async function getPaymentMethods(token?: string): Promise<PaymentMethod[]> {
  const data = await apiClient<any>("/payments/payment-methods", { method: "GET", ...(token ? { token } : {}) });
  return toArray<any>(data, ["paymentMethods", "items", "data"]).map(normalizeMethod);
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

export async function getPaymentsOpsSummary(limit = 25, token?: string) {
  return apiClient<any>(`/payments/ops-summary?limit=${encodeURIComponent(String(limit))}`, {
    method: "GET",
    ...(token ? { token } : {}),
  });
}

export async function executePaymentsBulkAction(
  payload: {
    action: "SEND_PAYMENT_REMINDER" | "RETRY_FAILED_PAYMENT";
    ids: Array<string | number>;
    simulate?: boolean;
    confirm?: boolean;
    simulationToken?: string;
  },
  token?: string,
) {
  return apiClient<any>(`/payments/ops-summary/bulk-action`, {
    method: "POST",
    body: JSON.stringify(payload),
    ...(token ? { token } : {}),
  });
}
