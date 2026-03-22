import { NextRequest, NextResponse } from "next/server";
import { extractRoleFromJwt, isSecureCookieRequest, SESSION_ROLE_COOKIE, SESSION_TOKEN_COOKIE } from "@/lib/auth/cookies";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = String(body?.token || "").trim();
    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 400 });
    }

    const role = await extractRoleFromJwt(token);
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
