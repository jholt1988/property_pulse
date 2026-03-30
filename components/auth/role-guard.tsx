"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { extractRoleFromToken, type AppRole } from "@/lib/auth/roles";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m?.[1] ?? null;
}

export function RoleGuard({ allowedRoles, children }: { allowedRoles: AppRole[]; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const role = useMemo(() => {
    const roleCookie = getCookie("session_role");
    if (roleCookie === "PM") return "PROPERTY_MANAGER" as AppRole;
    if (roleCookie && ["TENANT", "PROPERTY_MANAGER", "ADMIN"].includes(roleCookie)) return roleCookie as AppRole;
    return extractRoleFromToken(getCookie("session_token"));
  }, [pathname]);

  useEffect(() => {
    // session_token is httpOnly by design, so browser JS cannot read it.
    // Use role cookie / decoded role to decide client-side gating.
    if (!role) {
      router.replace("/login");
      return;
    }
    setAuthorized(allowedRoles.includes(role));
    setChecked(true);
  }, [allowedRoles, role, router]);

  if (!checked) return <main className="p-6">Checking access...</main>;

  if (!authorized) {
    return (
      <main className="p-6">
        <div className="max-w-xl rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">Access denied</p>
          <p className="mt-1">Your account role does not have permission to view this area.</p>
          <div className="mt-3">
            <Link href="/login" className="underline">Return to login</Link>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
