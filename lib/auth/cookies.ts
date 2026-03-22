export const SESSION_TOKEN_COOKIE = "session_token";
export const SESSION_ROLE_COOKIE = "session_role";

export function isSecureCookieRequest() {
  const env = process.env.NODE_ENV;
  return env === "production";
}

export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function extractRoleFromJwt(token: string): "TENANT" | "PROPERTY_MANAGER" | "ADMIN" | null {
  const payload = decodeJwtPayload(token);
  const role = payload?.role ?? payload?.user?.role ?? payload?.authorities?.[0];
  if (role === "TENANT" || role === "PROPERTY_MANAGER" || role === "ADMIN") return role;
  return null;
}
