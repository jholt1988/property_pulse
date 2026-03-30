import { apiClient } from "./client";

export async function getLeaseEnvelopes(leaseId: string | number, token?: string) {
  return apiClient<any>(`/api/esignature/leases/${leaseId}/envelopes`, { method: "GET", ...(token ? { token } : {}) });
}

export async function createLeaseEnvelope(leaseId: string | number, payload: any, token?: string) {
  return apiClient<any>(`/api/esignature/leases/${leaseId}/envelopes`, {
    method: "POST",
    body: JSON.stringify(payload),
    ...(token ? { token } : {}),
  });
}

export async function getEnvelope(envelopeId: string, token?: string) {
  return apiClient<any>(`/api/esignature/envelopes/${envelopeId}`, { method: "GET", ...(token ? { token } : {}) });
}

export async function resendEnvelope(envelopeId: string, token?: string) {
  return apiClient<any>(`/api/esignature/envelopes/${envelopeId}/resend`, { method: "POST", ...(token ? { token } : {}) });
}

export async function voidEnvelope(envelopeId: string, payload: any, token?: string) {
  return apiClient<any>(`/api/esignature/envelopes/${envelopeId}/void`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    ...(token ? { token } : {}),
  });
}
