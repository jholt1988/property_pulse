"use client";

import { useCallback, useEffect, useState } from "react";
import { createEstimateFromInspection, decideInspectionRequest, getInspectionEstimates, getInspectionRequests } from "@/lib/api";

export default function ManagerInspectionsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedInspectionId, setSelectedInspectionId] = useState("");
  const [estimates, setEstimates] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const token = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1] : undefined;

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await getInspectionRequests(token);
      setRequests(Array.isArray(r) ? r : r?.data || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load inspection requests");
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const decide = async (id: string | number, decision: "APPROVE" | "REJECT") => {
    try {
      await decideInspectionRequest(id, { decision }, token);
      await load();
    } catch (e: any) {
      setError(e?.message || "Decision failed");
    }
  };

  const generateEstimate = async () => {
    try {
      await createEstimateFromInspection(selectedInspectionId, token);
      const est = await getInspectionEstimates(selectedInspectionId, token);
      setEstimates(est);
    } catch (e: any) {
      setError(e?.message || "Estimate generation failed");
    }
  };

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Inspection Review</h1>
        <p className="text-sm text-gray-500">Approve/reject requests and create estimates.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="rounded border p-4">
        <h2 className="font-medium">Requests</h2>
        {requests.length === 0 ? <p className="mt-2 text-sm text-gray-500">No pending requests.</p> : (
          <ul className="mt-3 space-y-2">
            {requests.map((r) => (
              <li key={String(r.id)} className="flex items-center justify-between rounded border p-3">
                <div>
                  <p className="text-sm font-medium">Request #{r.id}</p>
                  <p className="text-xs text-gray-500">{r.status || "UNKNOWN"}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded border px-3 py-1 text-xs" onClick={() => decide(r.id, "APPROVE")}>Approve</button>
                  <button className="rounded border border-red-300 px-3 py-1 text-xs text-red-700" onClick={() => decide(r.id, "REJECT")}>Reject</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded border p-4 space-y-3">
        <h2 className="font-medium">Estimate Generation</h2>
        <div className="flex gap-2">
          <input className="rounded border px-3 py-2 text-sm" placeholder="Inspection ID" value={selectedInspectionId} onChange={(e) => setSelectedInspectionId(e.target.value)} />
          <button className="rounded bg-black px-3 py-2 text-sm text-white" onClick={generateEstimate} disabled={!selectedInspectionId}>Create + Fetch Estimates</button>
        </div>
        <pre className="max-h-[20rem] overflow-auto text-xs">{JSON.stringify(estimates, null, 2)}</pre>
      </section>
    </main>
  );
}
