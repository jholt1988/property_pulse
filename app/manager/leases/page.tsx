"use client";

import { useEffect, useMemo, useState } from "react";
import { getManagerLeases } from "@/lib/api";

type Lease = {
  id: number;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  status: string;
  tenant?: { username?: string; email?: string };
  unit?: { name?: string; property?: { name?: string } | null };
};

const list = (d: any) => (Array.isArray(d) ? d : d?.data || d?.items || d?.leases || []);
const fmt = (n?: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);

export default function ManagerLeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [selected, setSelected] = useState<Lease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
        const d = await getManagerLeases(token);
        const l = list(d);
        setLeases(l);
        if (l[0]) setSelected(l[0]);
      } catch (e: any) {
        setError(e?.message || "Failed to load leases");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const stats = useMemo(() => ({
    total: leases.length,
    active: leases.filter((l) => String(l.status).toUpperCase() === "ACTIVE").length,
    endingSoon: leases.filter((l) => {
      const d = new Date(l.endDate).getTime() - Date.now();
      return d > 0 && d < 1000 * 60 * 60 * 24 * 60;
    }).length,
  }), [leases]);

  if (loading) return <main className="p-6">Loading leases...</main>;

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Manager Leases</h1>
        <p className="text-sm text-gray-500">Lease portfolio and contract details.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Total</p><p className="text-xl font-semibold">{stats.total}</p></div>
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Active</p><p className="text-xl font-semibold">{stats.active}</p></div>
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Ending &lt; 60 days</p><p className="text-xl font-semibold">{stats.endingSoon}</p></div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_2fr]">
        <aside className="rounded border">
          <h2 className="border-b px-4 py-3 text-sm font-medium">Leases</h2>
          <ul className="max-h-[32rem] divide-y overflow-y-auto">
            {leases.length === 0 ? <li className="p-4 text-sm text-gray-500">No leases found.</li> : leases.map((l) => (
              <li key={l.id}><button className={`w-full px-4 py-3 text-left text-sm ${selected?.id === l.id ? "bg-gray-100" : "hover:bg-gray-50"}`} onClick={() => setSelected(l)}><p className="font-medium">Lease #{l.id} · {l.tenant?.username || "Tenant"}</p><p className="text-xs text-gray-500">{l.unit?.property?.name || "Property"} · {l.unit?.name || "Unit"}</p></button></li>
            ))}
          </ul>
        </aside>

        <section className="rounded border p-4">
          {selected ? (
            <div className="space-y-3 text-sm">
              <h2 className="text-lg font-semibold">Lease #{selected.id}</h2>
              <p><b>Tenant:</b> {selected.tenant?.username || "-"} {selected.tenant?.email ? `(${selected.tenant.email})` : ""}</p>
              <p><b>Unit:</b> {selected.unit?.property?.name || "Property"} · {selected.unit?.name || "Unit"}</p>
              <p><b>Term:</b> {new Date(selected.startDate).toLocaleDateString()} → {new Date(selected.endDate).toLocaleDateString()}</p>
              <p><b>Status:</b> {selected.status}</p>
              <p><b>Rent:</b> {fmt(selected.rentAmount)} / month</p>
              <p><b>Deposit:</b> {fmt(selected.depositAmount)}</p>
            </div>
          ) : <p className="text-sm text-gray-500">Select a lease.</p>}
        </section>
      </div>
    </main>
  );
}
