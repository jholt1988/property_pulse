"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getInspections, getInspectionRequests, startInspection, submitInspectionRequest } from "@/lib/api";

type Inspection = {
  id: number;
  type: string;
  status: string;
  scheduledDate: string;
  completedDate?: string | null;
  notes?: string | null;
  unit?: { name?: string; property?: { name?: string } };
};

const list = (d: any) => (Array.isArray(d) ? d : d?.data || d?.items || d?.inspections || []);
const label = (s: string) => String(s || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());

export default function TenantInspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [requestType, setRequestType] = useState<"MOVE_IN" | "MOVE_OUT">("MOVE_IN");
  const [requestNotes, setRequestNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1] : undefined;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [i, r] = await Promise.all([
        getInspections(token),
        getInspectionRequests(token).catch(() => []),
      ]);
      setInspections(list(i));
      setRequests(Array.isArray(r) ? r : list(r));
    } catch (e: any) {
      if (String(e?.message || "").includes("404")) setInspections([]);
      else setError(e?.message || "Failed to load inspections");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const sorted = useMemo(() => [...inspections].sort((a, b) => new Date(b.scheduledDate || 0).getTime() - new Date(a.scheduledDate || 0).getTime()), [inspections]);

  const submitReq = async () => {
    setRequesting(true);
    setError(null);
    try {
      await submitInspectionRequest({ type: requestType, notes: requestNotes.trim() || undefined }, token);
      setRequestNotes("");
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to submit request");
    } finally { setRequesting(false); }
  };

  const startApproved = async (requestId: number) => {
    setRequesting(true);
    setError(null);
    try {
      await startInspection(requestId, token);
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to start inspection");
    } finally { setRequesting(false); }
  };

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Inspections</h1>
        <p className="text-sm text-gray-500">View upcoming/past inspections and request move-in/move-out inspections.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="rounded border p-4 space-y-3">
        <h2 className="font-medium">Request inspection</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <select className="rounded border px-3 py-2" value={requestType} onChange={(e) => setRequestType(e.target.value as "MOVE_IN" | "MOVE_OUT")}>
            <option value="MOVE_IN">Move-in</option>
            <option value="MOVE_OUT">Move-out</option>
          </select>
          <textarea className="rounded border px-3 py-2 md:col-span-2" rows={2} value={requestNotes} onChange={(e) => setRequestNotes(e.target.value)} placeholder="Notes (optional)" />
        </div>
        <button className="rounded bg-black px-4 py-2 text-white disabled:opacity-50" disabled={requesting} onClick={submitReq}>{requesting ? "Submitting..." : "Submit request"}</button>

        {requests.filter((r) => r?.status === "APPROVED").length > 0 && (
          <div className="rounded border bg-green-50 p-3">
            <p className="mb-2 text-sm font-medium">Approved requests ready to start</p>
            <div className="space-y-2">
              {requests.filter((r) => r?.status === "APPROVED").slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <span>{label(r.type)} request #{r.id}</span>
                  <button className="rounded border px-2 py-1" onClick={() => startApproved(Number(r.id))}>Start</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        {loading ? <p className="text-sm text-gray-500">Loading inspections...</p> : sorted.length === 0 ? <p className="text-sm text-gray-500">No inspections found.</p> : sorted.map((i) => (
          <Link key={i.id} href={`/tenant/inspections/${i.id}`} className="block rounded border p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{label(i.type)} Inspection</p>
                <p className="text-sm text-gray-500">{i.unit?.property?.name || "Property"} · {i.unit?.name || "Unit"}</p>
                <p className="text-sm text-gray-500">Scheduled: {i.scheduledDate ? new Date(i.scheduledDate).toLocaleDateString() : "TBD"}</p>
              </div>
              <span className="text-xs">{i.status}</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
