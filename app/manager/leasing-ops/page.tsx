"use client";

import { useEffect, useMemo, useState } from "react";
import { executeLeasingBulkAction, getLeasingOpsSummary, type BulkActionType } from "@/lib/api";

const tokenFromCookie = () =>
  typeof document !== "undefined"
    ? document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1]
    : undefined;

type Row = { id: string | number; recommendation?: { action?: BulkActionType; reason?: string; priority?: string } };

export default function LeasingOpsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(25);
  const [selectedAction, setSelectedAction] = useState<BulkActionType>("FOLLOW_UP_APPLICANT");
  const [result, setResult] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [runHistory, setRunHistory] = useState<any[]>([]);

  const refresh = async (nextLimit = limit) => {
    setLoading(true);
    setError(null);
    try {
      const token = tokenFromCookie();
      const res = await getLeasingOpsSummary(nextLimit, token);
      setData(res);
    } catch (e: any) {
      setError(e?.message || "Failed to load leasing ops summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    try {
      const raw = localStorage.getItem("leasingOpsRunHistory");
      if (raw) setRunHistory(JSON.parse(raw));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const idsForAction = useMemo(() => {
    return (data?.bulkActions?.[selectedAction] || []) as Array<string | number>;
  }, [data, selectedAction]);

  const runBulk = async (simulate: boolean, confirm: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const session = tokenFromCookie();
      const payload: any = {
        action: selectedAction,
        ids: idsForAction,
        simulate,
        confirm,
      };

      if (selectedAction === "CONVERT_TO_LEASE") {
        payload.options = {
          startDate: new Date().toISOString().slice(0, 10),
          endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        };
      }

      if (confirm && token) {
        payload.simulationToken = token;
      }

      const res = await executeLeasingBulkAction(payload, session);
      setResult(res);
      const entry = {
        at: new Date().toISOString(),
        action: selectedAction,
        simulate,
        confirm,
        requested: res?.requested ?? idsForAction.length,
        succeeded: res?.succeeded ?? 0,
        failed: res?.failed ?? 0,
      };
      setRunHistory((prev) => {
        const next = [entry, ...prev].slice(0, 50);
        try { localStorage.setItem("leasingOpsRunHistory", JSON.stringify(next)); } catch {}
        return next;
      });
      if (simulate && res?.simulationToken) setToken(res.simulationToken);
      if (!simulate) await refresh();
    } catch (e: any) {
      setError(e?.message || "Bulk action failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <main className="p-6">Loading leasing operations...</main>;

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Leasing Operations</h1>
        <p className="text-sm text-gray-500">Unified queue for stale applications, e-sign risks, and conversion backlog.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="grid gap-3 md:grid-cols-4">
        <div className="rounded border p-3"><p className="text-xs text-gray-500">Stale lead apps</p><p className="text-xl font-semibold">{data?.counts?.staleLeadApplications ?? 0}</p></div>
        <div className="rounded border p-3"><p className="text-xs text-gray-500">Signature risk</p><p className="text-xl font-semibold">{data?.counts?.signatureRiskEnvelopes ?? 0}</p></div>
        <div className="rounded border p-3"><p className="text-xs text-gray-500">Approved not converted</p><p className="text-xl font-semibold">{data?.counts?.approvedNotConvertedApplications ?? 0}</p></div>
        <div className="rounded border p-3">
          <p className="text-xs text-gray-500">Limit</p>
          <div className="mt-1 flex gap-2">
            <input className="w-20 rounded border px-2 py-1 text-sm" type="number" value={limit} min={1} max={100} onChange={(e) => setLimit(Number(e.target.value || 25))} />
            <button className="rounded border px-2 py-1 text-sm" onClick={() => refresh(limit)}>Refresh</button>
          </div>
        </div>
      </section>

      <section className="rounded border p-4 space-y-3">
        <h2 className="font-medium">Bulk Execution</h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label>Action</label>
          <select className="rounded border px-2 py-1" value={selectedAction} onChange={(e) => setSelectedAction(e.target.value as BulkActionType)}>
            <option value="FOLLOW_UP_APPLICANT">FOLLOW_UP_APPLICANT</option>
            <option value="SEND_SIGNATURE_REMINDER">SEND_SIGNATURE_REMINDER</option>
            <option value="RETRY_SEND_ENVELOPE">RETRY_SEND_ENVELOPE</option>
            <option value="CONVERT_TO_LEASE">CONVERT_TO_LEASE</option>
          </select>
          <span className="text-gray-500">IDs in group: {idsForAction.length}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button disabled={busy || idsForAction.length === 0} className="rounded border px-3 py-1 text-sm disabled:opacity-60" onClick={() => runBulk(true, false)}>Simulate</button>
          <button disabled={busy || idsForAction.length === 0} className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-60" onClick={() => runBulk(false, true)}>Execute Confirmed</button>
          <span className="self-center text-xs text-gray-500">High-impact actions require simulate token.</span>
        </div>
        {token && <p className="text-xs text-gray-600">Simulation token ready for confirm flow.</p>}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Panel title="Stale Lead Applications" rows={data?.staleLeadApplications || []} />
        <Panel title="Signature Risk Envelopes" rows={data?.signatureRiskEnvelopes || []} />
        <Panel title="Approved Not Converted" rows={data?.approvedNotConvertedApplications || []} />
      </section>

      <section className="rounded border p-4">
        <h2 className="font-medium">Bulk Result</h2>
        <pre className="mt-2 max-h-[26rem] overflow-auto text-xs">{JSON.stringify(result, null, 2)}</pre>
      </section>

      <section className="rounded border p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-medium">Ops Run History</h2>
          <button
            className="rounded border px-2 py-1 text-xs"
            onClick={() => {
              setRunHistory([]);
              try { localStorage.removeItem("leasingOpsRunHistory"); } catch {}
            }}
          >
            Clear
          </button>
        </div>
        {runHistory.length === 0 ? (
          <p className="text-sm text-gray-500">No runs yet.</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-left text-xs">
              <thead><tr className="border-b"><th className="p-2">Time</th><th className="p-2">Action</th><th className="p-2">Mode</th><th className="p-2">Requested</th><th className="p-2">Succeeded</th><th className="p-2">Failed</th></tr></thead>
              <tbody>
                {runHistory.map((r, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{new Date(r.at).toLocaleString()}</td>
                    <td className="p-2">{r.action}</td>
                    <td className="p-2">{r.simulate ? "SIMULATE" : r.confirm ? "CONFIRMED" : "RUN"}</td>
                    <td className="p-2">{r.requested}</td>
                    <td className="p-2">{r.succeeded}</td>
                    <td className="p-2">{r.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Panel({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <article className="rounded border p-4">
      <h3 className="mb-2 font-medium">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">No items.</p>
      ) : (
        <ul className="space-y-2 text-xs">
          {rows.slice(0, 20).map((row: any) => (
            <li key={row.id} className="rounded border p-2">
              <p className="font-medium">ID: {row.id}</p>
              <p className="text-gray-600">Action: {row.recommendation?.action || "-"}</p>
              <p className="text-gray-600">Reason: {row.recommendation?.reason || "-"}</p>
              <p className="text-gray-600">Priority: {row.recommendation?.priority || "-"}</p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
