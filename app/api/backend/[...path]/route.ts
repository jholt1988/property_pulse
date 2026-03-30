import { NextRequest, NextResponse } from "next/server";

const backendOrigin =
  process.env.BACKEND_API_ORIGIN ??
  process.env.NEXT_PUBLIC_BACKEND_API_ORIGIN ??
  "http://127.0.0.1:3001";

async function proxy(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const upstreamUrl = new URL(`${backendOrigin.replace(/\/$/, "")}/api/${path.join("/")}`);
  req.nextUrl.searchParams.forEach((value, key) => upstreamUrl.searchParams.append(key, value));

  const token = req.cookies.get("session_token")?.value;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  if (token && !headers.get("authorization")) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);

  const upstream = await fetch(upstreamUrl, {
    method,
    headers,
    body: hasBody ? req.body : undefined,
    duplex: hasBody ? "half" : undefined,
    redirect: "manual",
    cache: "no-store",
  } as RequestInit & { duplex?: "half" });

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("transfer-encoding");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
