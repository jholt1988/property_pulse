export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions extends RequestInit {
  method?: ApiMethod;
  token?: string;
}

// Default to the Next.js backend proxy path used for pms-master integration.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/backend";

export async function apiClient<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`API ${response.status}: ${text || response.statusText}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
