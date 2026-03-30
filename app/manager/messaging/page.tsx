"use client";

import { useState } from "react";
import { createBulkCampaign, getBulkCampaigns, getMessagingStats, searchConversations } from "@/lib/api";

export default function ManagerMessagingPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const token = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1] : undefined;

  const run = async (fn: () => Promise<any>) => {
    setError(null);
    try { setResult(await fn()); } catch (e: any) { setError(e?.message || "Request failed"); }
  };

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Messaging Admin</h1>
        <p className="text-sm text-gray-500">Stats, conversation search, and bulk campaign controls.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="flex flex-wrap gap-2 rounded border p-4">
        <button className="rounded border px-3 py-1 text-sm" onClick={() => run(() => getMessagingStats(token))}>Stats</button>
        <button className="rounded border px-3 py-1 text-sm" onClick={() => run(() => getBulkCampaigns(token))}>Bulk Campaigns</button>
        <button className="rounded bg-black px-3 py-1 text-sm text-white" onClick={() => run(() => createBulkCampaign({ template: "Hello {{firstName}}", recipients: [] }, token))}>Create Bulk (Demo)</button>
      </section>

      <section className="flex gap-2 rounded border p-4">
        <input className="flex-1 rounded border px-3 py-2 text-sm" placeholder="Search conversations" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="rounded border px-3 py-2 text-sm" onClick={() => run(() => searchConversations(query, token))}>Search</button>
      </section>

      <section className="rounded border p-4">
        <h2 className="font-medium">Response</h2>
        <pre className="mt-2 max-h-[32rem] overflow-auto text-xs">{JSON.stringify(result, null, 2)}</pre>
      </section>
    </main>
  );
}
