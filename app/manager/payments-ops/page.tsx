"use client";

import { useEffect, useMemo, useState } from "react";
import { executePaymentsBulkAction, getPaymentsOpsSummary } from "@/lib/api";

const tokenFromCookie = () =>
  typeof document !== "undefined"
    ? document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1]
    : undefined;

function downloadHistoryCsv(filename: string, rows: Array<{ at: string; action: string; simulate: boolean; confirm: boolean; requested: number; succeeded: number; failed: number }>) {
  const header = ["time", "action", "mode", "requested", "succeeded", "failed"];
  const lines = rows.map((r) => [
    new Date(r.at).toISOString(),
    r.action,
    r.simulate ? "SIMULATE" : r.confirm ? "CONFIRMED" : "RUN",
    String(r.requested),
    String(r.succeeded),
    String(r.failed),
  ]);
  const csv = [header, ...lines]
    .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

type HistoryRange = "today" | "7d" | "30d" | "all";

const filterHistoryByRange = (rows: any[], range: HistoryRange) => {
  if (range === "all") return rows;
  const now = new Date();
  const start = new Date(now);
  if (range === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (range === "7d") {
    start.setDate(start.getDate() - 7);
  } else if (range === "30d") {
    start.setDate(start.getDate() - 30);
  }
  return rows.filter((r) => new Date(r.at).getTime() >= start.getTime());
};

export default function PaymentsOpsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<"SEND_PAYMENT_REMINDER" | "RETRY_FAILED_PAYMENT">("SEND_PAYMENT_REMINDER");
  const [token, setToken] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [runHistory, setRunHistory] = useState<any[]>([]);
  const [historyRange, setHistoryRange] = useState<HistoryRange>("7d");

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPaymentsOpsSummary(50, tokenFromCookie());
      setData(res);
    } catch (e: any) {
      setError(e?.message || "Failed to load payments ops summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    try {
      const raw = localStorage.getItem("paymentsOpsRunHistory");
      if (raw) setRunHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const ids = useMemo(() => (data?.bulkActions?.[action] || []) as Array<string | number>, [data, action]);
  const filteredHistory = useMemo(() => filterHistoryByRange(runHistory, historyRange), [runHistory, historyRange]);

  const run = async (simulate: boolean, confirm: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const payload: any = { action, ids, simulate, confirm };
      if (confirm && token) payload.simulationToken = token;
      const res = await executePaymentsBulkAction(payload, tokenFromCookie());
      setResult(res);
      const entry = {
        at: new Date().toISOString(),
        action,
        simulate,
        confirm,
        requested: res?.requested ?? ids.length,
        succeeded: res?.succeeded ?? 0,
        failed: res?.failed ?? 0,
      };
      setRunHistory((prev) => {
        const next = [entry, ...prev].slice(0, 50);
        try { localStorage.setItem("paymentsOpsRunHistory", JSON.stringify(next)); } catch {}
        return next;
      });
      if (simulate && res?.simulationToken) setToken(res.simulationToken);
      if (!simulate) refresh();
    } catch (e: any) {
      setError(e?.message || "Bulk action failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <main className="p-6">Loading payments operations...</main>;

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Payments Operations</h1>
        <p className="text-sm text-gray-500">Delinquency and failed payment execution console.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Delinquent Accounts</p><p className="text-xl font-semibold">{data?.counts?.delinquentAccounts ?? 0}</p></div>
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Failed Payments</p><p className="text-xl font-semibold">{data?.counts?.failedPayments ?? 0}</p></div>
      </section>

      <section className="rounded border p-4 space-y-3">
        <h2 className="font-medium">Bulk Actions</h2>
        <div className="flex items-center gap-2 text-sm">
          <label>Action</label>
          <select className="rounded border px-2 py-1" value={action} onChange={(e) => setAction(e.target.value as any)}>
            <option value="SEND_PAYMENT_REMINDER">SEND_PAYMENT_REMINDER</option>
            <option value="RETRY_FAILED_PAYMENT">RETRY_FAILED_PAYMENT</option>
          </select>
          <span className="text-gray-500">IDs in group: {ids.length}</span>
        </div>
        <div className="flex gap-2">
          <button className="rounded border px-3 py-1 text-sm disabled:opacity-60" disabled={busy || ids.length === 0} onClick={() => run(true, false)}>Simulate</button>
          <button className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-60" disabled={busy || ids.length === 0} onClick={() => run(false, true)}>Execute Confirmed</button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded border p-4">
          <h3 className="mb-2 font-medium">Delinquency</h3>
          <pre className="max-h-[22rem] overflow-auto text-xs">{JSON.stringify(data?.delinquency || [], null, 2)}</pre>
        </article>
        <article className="rounded border p-4">
          <h3 className="mb-2 font-medium">Failed Payments</h3>
          <pre className="max-h-[22rem] overflow-auto text-xs">{JSON.stringify(data?.failedPayments || [], null, 2)}</pre>
        </article>
      </section>

      <section className="rounded border p-4">
        <h3 className="mb-2 font-medium">Bulk Result</h3>
        <pre className="max-h-[24rem] overflow-auto text-xs">{JSON.stringify(result, null, 2)}</pre>
      </section>

      <section className="rounded border p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-medium">Ops Run History</h3>
          <div className="flex gap-2">
            <select className="rounded border px-2 py-1 text-xs" value={historyRange} onChange={(e) => setHistoryRange(e.target.value as HistoryRange)}>
              <option value="today">Today</option>
              <option value="7d">Last 7d</option>
              <option value="30d">Last 30d</option>
              <option value="all">All</option>
            </select>
            <button
              className="rounded border px-2 py-1 text-xs"
              onClick={() => downloadHistoryCsv(`payments-ops-history-${historyRange}-${new Date().toISOString().slice(0, 10)}.csv`, filteredHistory)}
              disabled={filteredHistory.length === 0}
            >
              Export CSV
            </button>
            <button
              className="rounded border px-2 py-1 text-xs"
              onClick={() => {
                setRunHistory([]);
                try { localStorage.removeItem("paymentsOpsRunHistory"); } catch {}
              }}
            >
              Clear
            </button>
          </div>
        </div>
        {filteredHistory.length === 0 ? (
          <p className="text-sm text-gray-500">No runs yet.</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-left text-xs">
              <thead><tr className="border-b"><th className="p-2">Time</th><th className="p-2">Action</th><th className="p-2">Mode</th><th className="p-2">Requested</th><th className="p-2">Succeeded</th><th className="p-2">Failed</th></tr></thead>
              <tbody>
                {filteredHistory.map((r, i) => (
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
