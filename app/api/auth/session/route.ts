import { NextRequest, NextResponse } from "next/server";
import { extractRoleFromJwt, isSecureCookieRequest, SESSION_ROLE_COOKIE, SESSION_TOKEN_COOKIE } from "@/lib/auth/cookies";

type AppRole = "TENANT" | "PROPERTY_MANAGER" | "ADMIN";

function normalizeRole(raw: unknown): AppRole | null {
  const role = String(raw ?? "").toUpperCase();
  if (role === "PM") return "PROPERTY_MANAGER";
  if (role === "TENANT" || role === "PROPERTY_MANAGER" || role === "ADMIN") return role;
  return null;
}

async function resolveRoleFromBackend(token: string): Promise<AppRole | null> {
  const backendOrigin =
    process.env.BACKEND_API_ORIGIN ??
    process.env.NEXT_PUBLIC_BACKEND_API_ORIGIN ??
    "http://127.0.0.1:3001";

  const url = `${backendOrigin.replace(/\/$/, "")}/api/auth/me`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const payload = await res.json().catch(() => null);
  return normalizeRole(payload?.role ?? payload?.user?.role ?? payload?.authorities?.[0]);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = String(body?.token || "").trim();
    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 400 });
    }

    // Primary: ask backend who this user is.
    // Fallback: local JWT decode/verify (dev + compatibility).
    let role = await resolveRoleFromBackend(token);
    if (!role) {
      role = await extractRoleFromJwt(token);
    }
    if (!role) {
      return NextResponse.json({ message: "Unable to determine role" }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true, role });

    res.cookies.set({
      name: SESSION_TOKEN_COOKIE,
      value: token,
      httpOnly: true,
      secure: isSecureCookieRequest(),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    res.cookies.set({
      name: SESSION_ROLE_COOKIE,
      value: role,
      httpOnly: false,
      secure: isSecureCookieRequest(),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return res;
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
