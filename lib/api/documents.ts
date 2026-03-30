import { apiClient } from "./client";

export async function getDocuments(token?: string) {
  return apiClient<any>("/documents", { method: "GET", ...(token ? { token } : {}) });
}

export async function deleteDocument(id: string | number, token?: string) {
  return apiClient<any>(`/documents/${id}`, { method: "DELETE", ...(token ? { token } : {}) });
}

export async function shareDocument(id: string | number, payload: any, token?: string) {
  return apiClient<any>(`/documents/${id}/share`, {
    method: "POST",
    body: JSON.stringify(payload),
    ...(token ? { token } : {}),
  });
}
