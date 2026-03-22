import { NextRequest, NextResponse } from "next/server";
import { extractRoleFromJwt } from "@/lib/auth/cookies";

const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password", "/legal/privacy", "/legal/terms"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session_token")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const role = await extractRoleFromJwt(token);
  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/manager") && role !== "PROPERTY_MANAGER" && role !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/tenant/dashboard";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/tenant") && role !== "TENANT" && role !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/manager/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
