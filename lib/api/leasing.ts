import { apiClient } from "./client";

export type BulkActionType =
  | "FOLLOW_UP_APPLICANT"
  | "RETRY_SEND_ENVELOPE"
  | "SEND_SIGNATURE_REMINDER"
  | "CONVERT_TO_LEASE";

export type BulkActionRequest = {
  action: BulkActionType;
  ids: Array<string | number>;
  simulate?: boolean;
  confirm?: boolean;
  simulationToken?: string;
  options?: {
    startDate?: string;
    endDate?: string;
    rentAmount?: number;
    depositAmount?: number;
    moveInAt?: string;
    noticePeriodDays?: number;
  };
};

export async function getLeasingOpsSummary(limit = 25, token?: string) {
  return apiClient<any>(`/leasing/ops-summary?limit=${encodeURIComponent(String(limit))}`, {
    method: "GET",
    ...(token ? { token } : {}),
  });
}

export async function executeLeasingBulkAction(payload: BulkActionRequest, token?: string) {
  return apiClient<any>(`/leasing/ops-summary/bulk-action`, {
    method: "POST",
    body: JSON.stringify(payload),
    ...(token ? { token } : {}),
  });
}
