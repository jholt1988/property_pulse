"use client";

import Link from "next/link";
import { useState } from "react";
import { forgotPasswordRequest } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const data = await forgotPasswordRequest({ username });
      setMessage(data.message || "If the username exists, a password reset email has been sent.");
    } catch (err: any) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded border px-3 py-2"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          {error && <p className="text-xs italic text-red-500">{error}</p>}
          {message && <p className="text-xs italic text-green-600">{message}</p>}

          <div className="flex items-center justify-between">
            <button
              className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <Link href="/login" className="text-sm font-bold text-blue-500 hover:text-blue-800">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
