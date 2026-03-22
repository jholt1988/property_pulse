import { NextResponse } from "next/server";
import { SESSION_ROLE_COOKIE, SESSION_TOKEN_COOKIE } from "@/lib/auth/cookies";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: SESSION_TOKEN_COOKIE, value: "", path: "/", expires: new Date(0), httpOnly: true });
  res.cookies.set({ name: SESSION_ROLE_COOKIE, value: "", path: "/", expires: new Date(0), httpOnly: false });
  return res;
}
