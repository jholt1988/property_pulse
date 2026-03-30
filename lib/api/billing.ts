import { apiClient } from "./client";

export async function getConnectedAccount(token?: string) {
  return apiClient<any>("/billing/connected-account", { method: "GET", ...(token ? { token } : {}) });
}

export async function getAutopayNeedsAuth(token?: string) {
  return apiClient<any>("/billing/autopay/needs-auth-attempts", { method: "GET", ...(token ? { token } : {}) });
}

export async function getPlanCycles(token?: string) {
  return apiClient<any>("/billing/plan-cycles", { method: "GET", ...(token ? { token } : {}) });
}

export async function getPricingSnapshots(token?: string) {
  return apiClient<any>("/billing/pricing-snapshots", { method: "GET", ...(token ? { token } : {}) });
}

export async function runBilling(payload: any, token?: string) {
  return apiClient<any>("/billing/run", { method: "POST", body: JSON.stringify(payload), ...(token ? { token } : {}) });
}
