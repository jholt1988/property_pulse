"use client";

import { useState } from "react";
import { createLeaseEnvelope, getEnvelope, getLeaseEnvelopes, getRecipientView, resendEnvelope, voidEnvelope } from "@/lib/api";

export default function ManagerEsignaturePage() {
  const [leaseId, setLeaseId] = useState("");
  const [envelopeId, setEnvelopeId] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const token = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1] : undefined;

  const run = async (fn: () => Promise<any>) => {
    setError(null);
    setBusy(true);
    try {
      const res = await fn();
      setResult(res);
      const maybeUrl = res?.url || res?.recipientViewUrl;
      if (typeof maybeUrl === "string" && maybeUrl.startsWith("http")) {
        window.open(maybeUrl, "_blank", "noopener,noreferrer");
      }
    } catch (e: any) {
      setError(e?.message || "Request failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">E-signature Console</h1>
        <p className="text-sm text-gray-500">Envelope lifecycle operations for leases.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded border p-4 space-y-3">
          <h2 className="font-medium">Lease Envelopes</h2>
          <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Lease ID" value={leaseId} onChange={(e) => setLeaseId(e.target.value)} />
          <div className="flex gap-2">
            <button className="rounded border px-3 py-1 text-sm disabled:opacity-60" disabled={!leaseId || busy} onClick={() => run(() => getLeaseEnvelopes(leaseId, token))}>List</button>
            <button className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-60" disabled={!leaseId || busy} onClick={() => run(() => createLeaseEnvelope(leaseId, {}, token))}>Create</button>
          </div>
        </div>

        <div className="rounded border p-4 space-y-3">
          <h2 className="font-medium">Envelope Actions</h2>
          <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Envelope ID" value={envelopeId} onChange={(e) => setEnvelopeId(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <button className="rounded border px-3 py-1 text-sm disabled:opacity-60" disabled={!envelopeId || busy} onClick={() => run(() => getEnvelope(envelopeId, token))}>Get</button>
            <button className="rounded border px-3 py-1 text-sm disabled:opacity-60" disabled={!envelopeId || busy} onClick={() => run(() => resendEnvelope(envelopeId, token))}>Resend</button>
            <button className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 disabled:opacity-60" disabled={!envelopeId || busy} onClick={() => run(() => voidEnvelope(envelopeId, { reason: "Voided from manager console" }, token))}>Void</button>
          </div>
          <div className="space-y-2 rounded bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-600">Recipient View</p>
            <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Recipient email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
            <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Recipient name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
            <button
              className="rounded border px-3 py-1 text-sm disabled:opacity-60"
              disabled={!envelopeId || !recipientEmail || !recipientName || busy}
              onClick={() => run(() => getRecipientView(envelopeId, { recipientEmail, recipientName }, token))}
            >
              Open Recipient View
            </button>
          </div>
        </div>
      </section>

      <section className="rounded border p-4">
        <h2 className="font-medium">Response</h2>
        <pre className="mt-2 max-h-[32rem] overflow-auto text-xs">{JSON.stringify(result, null, 2)}</pre>
      </section>
    </main>
  );
}
