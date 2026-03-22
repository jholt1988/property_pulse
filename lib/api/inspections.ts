import { apiClient } from "./client";

export async function getInspections(token?: string) {
  return apiClient<any>("/inspections", { method: "GET", ...(token ? { token } : {}) });
}

export async function getInspectionById(id: number, token?: string) {
  return apiClient<any>(`/inspections/${id}`, { method: "GET", ...(token ? { token } : {}) });
}

export async function getInspectionRequests(token?: string) {
  return apiClient<any>("/inspections/requests", { method: "GET", ...(token ? { token } : {}) });
}

export async function submitInspectionRequest(
  payload: { type: "MOVE_IN" | "MOVE_OUT"; notes?: string },
  token?: string,
) {
  return apiClient<any>("/inspections/requests", {
    method: "POST",
    body: JSON.stringify(payload),
    ...(token ? { token } : {}),
  });
}

export async function startInspection(requestId: number, token?: string) {
  return apiClient<any>("/inspections/start", {
    method: "POST",
    body: JSON.stringify({ requestId }),
    ...(token ? { token } : {}),
  });
}

export async function patchRoomItems(roomId: number, items: any[], token?: string) {
  return apiClient<any>(`/inspections/rooms/${roomId}/items`, {
    method: "PATCH",
    body: JSON.stringify(items),
    ...(token ? { token } : {}),
  });
}

export async function uploadInspectionItemPhoto(itemId: number, payload: { url: string; caption?: string }, token?: string) {
  return apiClient<any>(`/inspections/items/${itemId}/photos`, {
    method: "POST",
    body: JSON.stringify(payload),
    ...(token ? { token } : {}),
  });
}

export async function updateInspectionStatus(id: number, status: "COMPLETED", token?: string) {
  return apiClient<any>(`/inspections/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    ...(token ? { token } : {}),
  });
}
