import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/lib/constants/roles";

export type SessionUser = {
  id: string;
  email: string;
  role: Role;
};

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get("session_token")?.value ?? null;
}

export async function requireSession(): Promise<string> {
  const token = await getSessionToken();
  if (!token) redirect("/login");
  return token;
}

export async function requireRole(_allowed: Role[]): Promise<void> {
  // TODO: decode token / fetch user profile and enforce role checks.
  await requireSession();
}
