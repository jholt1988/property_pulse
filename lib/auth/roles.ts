export type AppRole = "TENANT" | "PROPERTY_MANAGER" | "ADMIN";

function decodeJwtPayload(token: string): any | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function extractRoleFromToken(token?: string | null): AppRole | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  const role = payload?.role ?? payload?.user?.role ?? payload?.authorities?.[0];
  if (role === "TENANT" || role === "PROPERTY_MANAGER" || role === "ADMIN") return role;
  return null;
}
