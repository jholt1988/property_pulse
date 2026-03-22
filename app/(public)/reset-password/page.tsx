"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordRequest } from "@/lib/api";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) setToken(tokenParam);
    else setError("Invalid reset link. Please check your email for the correct link.");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) return setError("Passwords do not match");
    if (newPassword.length < 8) return setError("Password must be at least 8 characters long");

    setLoading(true);
    try {
      await resetPasswordRequest({ token, newPassword });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
          <h2 className="mb-4 text-2xl font-bold text-green-600">Password Reset Successful</h2>
          <p className="mb-4">Your password has been reset successfully. Redirecting to login...</p>
          <Link href="/login" className="text-blue-500 hover:text-blue-800">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full rounded border px-3 py-2" type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
          <input className="w-full rounded border px-3 py-2" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
          {error && <p className="text-xs italic text-red-500">{error}</p>}
          <div className="flex items-center justify-between">
            <button className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50" type="submit" disabled={loading || !token}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <Link href="/login" className="text-sm font-bold text-blue-500 hover:text-blue-800">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="p-6">Loading reset form...</main>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
