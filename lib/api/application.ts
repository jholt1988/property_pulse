import { apiClient } from "./client";

export type PublicProperty = {
  id: number;
  name: string;
  address: string;
  units: Array<{ id: number; name: string; rent?: number }>;
};

export type RentalApplicationPayload = {
  propertyId: number;
  unitId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  previousAddress: string;
  income?: number;
  creditScore?: number;
  monthlyDebt?: number;
  references?: Array<{ name: string; relationship?: string; phone?: string; email?: string; yearsKnown?: string }>;
  authorizeCreditCheck: boolean;
  authorizeBackgroundCheck: boolean;
  authorizeEmploymentVerification: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  termsVersion: string;
  privacyVersion: string;
  negativeAspectsExplanation?: string;
};

export async function getPublicProperties() {
  return apiClient<PublicProperty[]>("/properties/public", { method: "GET" });
}

export async function submitRentalApplication(payload: RentalApplicationPayload, token?: string) {
  return apiClient<{ id?: number | string }>("/rental-applications", {
    method: "POST",
    body: JSON.stringify(payload),
    ...(token ? { token } : {}),
  });
}
