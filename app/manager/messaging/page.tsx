"use client";

import { useState } from "react";
import { createBulkCampaign, getBulkCampaigns, getMessagingStats, previewBulkCampaign, searchConversations } from "@/lib/api";

export default function ManagerMessagingPage() {
  const [query, setQuery] = useState("");
  const [template, setTemplate] = useState("Hello {{firstName}}, this is a portfolio update.");
  const [recipientsJson, setRecipientsJson] = useState('[{"userId":"1","firstName":"Alex"}]');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const token = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1] : undefined;

  const run = async (fn: () => Promise<any>) => {
    setError(null);
    setBusy(true);
    try {
      setResult(await fn());
    } catch (e: any) {
      setError(e?.message || "Request failed");
    } finally {
      setBusy(false);
    }
  };

  const parseRecipients = () => {
    try {
      const parsed = JSON.parse(recipientsJson);
      if (!Array.isArray(parsed)) throw new Error("Recipients must be an array");
      return parsed;
    } catch (e: any) {
      throw new Error(`Invalid recipients JSON: ${e?.message || "parse failed"}`);
    }
  };

  const buildPayload = () => ({
    template,
    recipients: parseRecipients(),
  });

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Messaging Admin</h1>
        <p className="text-sm text-gray-500">Stats, conversation search, and bulk campaign controls.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="flex flex-wrap gap-2 rounded border p-4">
        <button className="rounded border px-3 py-1 text-sm disabled:opacity-60" disabled={busy} onClick={() => run(() => getMessagingStats(token))}>Stats</button>
        <button className="rounded border px-3 py-1 text-sm disabled:opacity-60" disabled={busy} onClick={() => run(() => getBulkCampaigns(token))}>Bulk Campaigns</button>
      </section>

      <section className="flex gap-2 rounded border p-4">
        <input className="flex-1 rounded border px-3 py-2 text-sm" placeholder="Search conversations" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="rounded border px-3 py-2 text-sm disabled:opacity-60" disabled={busy} onClick={() => run(() => searchConversations(query, token))}>Search</button>
      </section>

      <section className="space-y-3 rounded border p-4">
        <h2 className="font-medium">Bulk Campaign Builder</h2>
        <input className="w-full rounded border px-3 py-2 text-sm" value={template} onChange={(e) => setTemplate(e.target.value)} placeholder="Message template" />
        <textarea
          className="h-40 w-full rounded border px-3 py-2 font-mono text-xs"
          value={recipientsJson}
          onChange={(e) => setRecipientsJson(e.target.value)}
          placeholder='[{"userId":"1","firstName":"Alex"}]'
        />
        <div className="flex gap-2">
          <button
            className="rounded border px-3 py-2 text-sm disabled:opacity-60"
            disabled={busy}
            onClick={() => run(() => previewBulkCampaign(buildPayload(), token))}
          >
            Preview
          </button>
          <button
            className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
            disabled={busy}
            onClick={() => run(() => createBulkCampaign(buildPayload(), token))}
          >
            Create Bulk Campaign
          </button>
        </div>
      </section>

      <section className="rounded border p-4">
        <h2 className="font-medium">Response</h2>
        <pre className="mt-2 max-h-[32rem] overflow-auto text-xs">{JSON.stringify(result, null, 2)}</pre>
      </section>
    </main>
  );
}
