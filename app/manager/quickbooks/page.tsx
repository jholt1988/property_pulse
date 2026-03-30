"use client";

import { useEffect, useState } from "react";
import { disconnectQuickBooks, getQuickBooksAuthUrl, getQuickBooksStatus, syncQuickBooks, testQuickBooksConnection } from "@/lib/api";

export default function ManagerQuickBooksPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
      const s = await getQuickBooksStatus(token);
      setStatus(s);
    } catch (e: any) {
      setError(e?.message || "Failed to load QuickBooks status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const run = async (fn: (token?: string) => Promise<any>, openUrl = false) => {
    setError(null);
    try {
      const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
      const res = await fn(token);
      if (openUrl && res?.authUrl) window.open(res.authUrl, "_blank", "noopener,noreferrer");
      await load();
    } catch (e: any) {
      setError(e?.message || "Action failed");
    }
  };

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">QuickBooks Integration</h1>
        <p className="text-sm text-gray-500">Authorize, test, sync, and disconnect accounting integration.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="flex flex-wrap gap-3">
        <button className="rounded bg-black px-4 py-2 text-sm text-white" onClick={() => run(getQuickBooksAuthUrl, true)}>Open Auth URL</button>
        <button className="rounded border px-4 py-2 text-sm" onClick={() => run(testQuickBooksConnection)}>Test Connection</button>
        <button className="rounded border px-4 py-2 text-sm" onClick={() => run(syncQuickBooks)}>Sync Now</button>
        <button className="rounded border border-red-300 px-4 py-2 text-sm text-red-700" onClick={() => run(disconnectQuickBooks)}>Disconnect</button>
      </section>

      <section className="rounded border p-4">
        <h2 className="font-medium">Current Status</h2>
        <pre className="mt-3 max-h-96 overflow-auto text-xs">{loading ? "Loading..." : JSON.stringify(status, null, 2)}</pre>
      </section>
    </main>
  );
}
