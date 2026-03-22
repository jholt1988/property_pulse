"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getPasswordPolicy, registerRequest } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"TENANT" | "PROPERTY_MANAGER" | "ADMIN">("TENANT");
  const [policy, setPolicy] = useState<{
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumber: boolean;
    requireSymbol: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getPasswordPolicy().then(setPolicy).catch(() => undefined);
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await registerRequest({ username, firstName, lastName, email, password, role });
      router.push("/login");
    } catch (err: any) {
      setError(err?.message ?? "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg ring-1 ring-gray-100">
        <h1 className="mb-2 text-center text-3xl font-semibold text-gray-900">Create your account</h1>
        <p className="mb-6 text-center text-sm text-gray-600">Access tenant services, payments, applications, and more.</p>

        <form className="space-y-4" onSubmit={handleSignup}>
          <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value as "TENANT" | "PROPERTY_MANAGER" | "ADMIN") }>
            <option value="TENANT">Tenant - Access applications, lease info, and payments</option>
            <option value="PROPERTY_MANAGER">Property Manager - Manage properties, tenants, and maintenance</option>
          </select>

          <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {policy && (
            <div className="rounded-md border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
              <p className="font-semibold text-indigo-800">Password requirements</p>
              <ul className="mt-2 space-y-1">
                <li>• Minimum length of {policy.minLength} characters</li>
                <li>• {policy.requireUppercase ? "At least one uppercase letter" : "Uppercase letters optional"}</li>
                <li>• {policy.requireLowercase ? "At least one lowercase letter" : "Lowercase letters optional"}</li>
                <li>• {policy.requireNumber ? "At least one number" : "Numbers optional"}</li>
                <li>• {policy.requireSymbol ? "At least one symbol" : "Symbols optional"}</li>
              </ul>
            </div>
          )}

          {error && <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

          <button type="submit" disabled={submitting} className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300">
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
