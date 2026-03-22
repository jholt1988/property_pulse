"use client";

import { useEffect, useMemo, useState } from "react";
import { getSecurityEvents } from "@/lib/api";

type Preset = "ALL" | "PROPERTY_OS";
const PROPERTY_OS_TYPES = new Set(["PROPERTY_OS_ANALYSIS_REQUEST", "PROPERTY_OS_ANALYSIS_SUCCESS", "PROPERTY_OS_ANALYSIS_FAILURE"]);

export default function ManagerAuditPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [preset, setPreset] = useState<Preset>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
        const d = await getSecurityEvents(200, token);
        const rows = Array.isArray(d) ? d : d?.data || d?.items || [];
        setEvents(rows);
      } catch (e: any) {
        setError(e?.message || "Failed to load audit events");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const filtered = useMemo(() => [...events]
    .filter((e) => preset === "PROPERTY_OS" ? PROPERTY_OS_TYPES.has(e.type) : true)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()), [events, preset]);

  if (loading) return <main className="p-6">Loading audit logs...</main>;

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Manager Audit Logs</h1>
        <p className="text-sm text-gray-500">Security and operational event trail.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="flex gap-2">
        <button className={`rounded-full px-3 py-1 text-xs ${preset === "ALL" ? "bg-black text-white" : "bg-gray-100"}`} onClick={() => setPreset("ALL")}>All events</button>
        <button className={`rounded-full px-3 py-1 text-xs ${preset === "PROPERTY_OS" ? "bg-black text-white" : "bg-gray-100"}`} onClick={() => setPreset("PROPERTY_OS")}>Property OS only</button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Events</p><p className="text-xl font-semibold">{filtered.length}</p></div>
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Success</p><p className="text-xl font-semibold">{filtered.filter((e) => e.success).length}</p></div>
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Failure</p><p className="text-xl font-semibold">{filtered.filter((e) => !e.success).length}</p></div>
      </section>

      <section className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase"><tr><th className="px-3 py-2 text-left">Event</th><th className="px-3 py-2 text-left">Actor</th><th className="px-3 py-2 text-left">IP</th><th className="px-3 py-2 text-left">Result</th><th className="px-3 py-2 text-left">Timestamp</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td className="px-3 py-4 text-gray-500" colSpan={5}>No audit activity.</td></tr> : filtered.map((e) => (
              <tr key={e.id} className="border-b align-top">
                <td className="px-3 py-2"><p className="font-medium">{e.type}</p>{e.metadata ? <details className="text-xs text-gray-500"><summary>Metadata</summary><pre className="mt-1 max-h-32 overflow-auto">{JSON.stringify(e.metadata, null, 2)}</pre></details> : null}</td>
                <td className="px-3 py-2">{e.username || "System"}</td>
                <td className="px-3 py-2">{e.ipAddress || "-"}</td>
                <td className="px-3 py-2">{e.success ? <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Success</span> : <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">Failure</span>}</td>
                <td className="px-3 py-2">{e.createdAt ? new Date(e.createdAt).toLocaleString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
