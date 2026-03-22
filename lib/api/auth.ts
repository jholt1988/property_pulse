import { apiClient } from "./client";

type LoginResponse = {
  access_token?: string;
  [key: string]: unknown;
};

type PasswordPolicy = {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSymbol: boolean;
};

export async function loginRequest(payload: {
  username: string;
  password: string;
  mfaCode?: string;
}) {
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPasswordPolicy() {
  return apiClient<PasswordPolicy>("/auth/password-policy", { method: "GET" });
}

export async function registerRequest(payload: {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "TENANT" | "PROPERTY_MANAGER" | "ADMIN";
}) {
  return apiClient<unknown>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function forgotPasswordRequest(payload: { username: string }) {
  return apiClient<{ message?: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPasswordRequest(payload: { token: string; newPassword: string }) {
  return apiClient<unknown>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
