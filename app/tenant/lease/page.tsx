"use client";

import { useEffect, useMemo, useState } from "react";
import { getMyLease, submitTenantNotice } from "@/lib/api";

type Lease = {
  id: number;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  status: string;
  noticePeriodDays?: number;
  unit?: { name: string; property?: { name: string } };
  renewalOffers?: Array<{ id: number; proposedRent: number; proposedStart: string; proposedEnd: string; status: string; expiresAt?: string }>;
  notices?: Array<{ id: number; type: string; sentAt: string; message?: string; deliveryMethod: string }>;
};

const fmt = (n?: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

export default function TenantLeasePage() {
  const [lease, setLease] = useState<Lease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [moveOutAt, setMoveOutAt] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1] : undefined;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await getMyLease(token)) as Lease | null;
      setLease(data || null);
      if (!data) setError("No active lease found.");
    } catch (e: any) {
      setError(e?.message || "Unable to load lease details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeOffers = useMemo(() => (lease?.renewalOffers || []).filter((o) => o.status === "OFFERED"), [lease]);

  const sendNotice = async () => {
    if (!lease) return;
    if (!moveOutAt) return setError("Please select a move-out date.");
    setSubmitting(true);
    setError(null);
    setFeedback(null);
    try {
      const updated = await submitTenantNotice(
        lease.id,
        { type: "MOVE_OUT", moveOutAt: new Date(`${moveOutAt}T00:00:00.000Z`).toISOString(), message: message.trim() || undefined },
        token,
      );
      setLease(updated as Lease);
      setFeedback("Move-out notice sent.");
      setMoveOutAt("");
      setMessage("");
    } catch (e: any) {
      setError(e?.message || "Unable to submit notice");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="p-6">Loading lease...</main>;

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">My Lease</h1>
        <p className="text-sm text-gray-500">Lease details, renewals, and move-out notice.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {feedback && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{feedback}</div>}

      {lease && (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded border p-4"><p className="text-xs text-gray-500">Property</p><p className="font-semibold">{lease.unit?.property?.name || "-"} · {lease.unit?.name || "-"}</p></div>
            <div className="rounded border p-4"><p className="text-xs text-gray-500">Term</p><p className="font-semibold">{new Date(lease.startDate).toLocaleDateString()} → {new Date(lease.endDate).toLocaleDateString()}</p></div>
            <div className="rounded border p-4"><p className="text-xs text-gray-500">Rent / Deposit</p><p className="font-semibold">{fmt(lease.rentAmount)} / {fmt(lease.depositAmount)}</p></div>
          </section>

          <section className="rounded border p-4">
            <h2 className="mb-2 font-medium">Renewal Offers</h2>
            {activeOffers.length === 0 ? <p className="text-sm text-gray-500">No open renewal offers.</p> : (
              <div className="space-y-2">{activeOffers.map((o) => <div key={o.id} className="rounded border p-3 text-sm">Offer #{o.id}: {fmt(o.proposedRent)} · {new Date(o.proposedStart).toLocaleDateString()} to {new Date(o.proposedEnd).toLocaleDateString()} · expires {o.expiresAt ? new Date(o.expiresAt).toLocaleDateString() : "-"}</div>)}</div>
            )}
          </section>

          <section className="rounded border p-4 space-y-3">
            <h2 className="font-medium">Plan Move-Out</h2>
            <input type="date" className="rounded border px-3 py-2" value={moveOutAt} onChange={(e) => setMoveOutAt(e.target.value)} />
            <textarea className="w-full rounded border px-3 py-2" rows={3} placeholder="Notes (optional)" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button onClick={sendNotice} disabled={submitting} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">{submitting ? "Sending..." : "Send Notice"}</button>
          </section>
        </>
      )}
    </main>
  );
}
