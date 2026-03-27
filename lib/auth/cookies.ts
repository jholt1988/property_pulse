import { decodeJwt, jwtVerify } from "jose";

export const SESSION_TOKEN_COOKIE = "session_token";
export const SESSION_ROLE_COOKIE = "session_role";

type AppRole = "TENANT" | "PROPERTY_MANAGER" | "ADMIN";

export function isSecureCookieRequest() {
  return process.env.NODE_ENV === "production";
}

function normalizeRole(payload: Record<string, any> | null): AppRole | null {
  const role = payload?.role ?? payload?.user?.role ?? payload?.authorities?.[0];
  if (role === "PM") return "PROPERTY_MANAGER";
  if (role === "TENANT" || role === "PROPERTY_MANAGER" || role === "ADMIN") return role;
  return null;
}

export async function extractRoleFromJwt(token: string): Promise<AppRole | null> {
  const secret = process.env.JWT_SECRET;

  // Preferred path: cryptographic signature verification.
  if (secret) {
    try {
      const encodedSecret = new TextEncoder().encode(secret);
      const { payload } = await jwtVerify(token, encodedSecret);
      return normalizeRole(payload as Record<string, any>);
    } catch {
      return null;
    }
  }

  // Fallback path for local/dev only when secret is not configured.
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  try {
    return normalizeRole(decodeJwt(token) as Record<string, any>);
  } catch {
    return null;
  }
}
