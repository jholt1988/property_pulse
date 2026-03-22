import { NextRequest, NextResponse } from "next/server";
import { extractRoleFromJwt } from "@/lib/auth/cookies";

const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password", "/legal/privacy", "/legal/terms"];

function buildCsp() {
  const isProd = process.env.NODE_ENV === "production";

  const scriptSrc = isProd
    ? "'self'"
    : "'self' 'unsafe-eval'";

  // Keep unsafe-inline for style/script compatibility with current UI stack.
  // Tighten further with nonce/hash strategy in a future pass.
  return [
    "default-src 'self'",
    `script-src ${scriptSrc} 'unsafe-inline'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: http:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

function withSecurityHeaders(res: NextResponse) {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Content-Security-Policy", buildCsp());

  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return withSecurityHeaders(NextResponse.next());
  }

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return withSecurityHeaders(NextResponse.next());
  }

  const token = req.cookies.get("session_token")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  const role = await extractRoleFromJwt(token);
  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  if (pathname.startsWith("/manager") && role !== "PROPERTY_MANAGER" && role !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/tenant/dashboard";
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  if (pathname.startsWith("/tenant") && role !== "TENANT" && role !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/manager/dashboard";
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
