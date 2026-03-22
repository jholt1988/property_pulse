"use client";

import { useEffect, useMemo, useState } from "react";
import { getManagerProperties } from "@/lib/api";

type Property = {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  unitCount?: number;
  propertyType?: string;
  units?: Array<{ id: string; name: string; status?: string; rent?: number }>;
};

const list = (d: any) => (Array.isArray(d) ? d : d?.data || d?.items || d?.properties || []);
const fmt = (n?: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);

export default function ManagerPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
        const d = await getManagerProperties(token);
        const p = list(d);
        setProperties(p);
        if (p[0]) setSelected(p[0]);
      } catch (e: any) {
        setError(e?.message || "Failed to load properties");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const totalUnits = useMemo(() => properties.reduce((s, p) => s + (p.unitCount || p.units?.length || 0), 0), [properties]);

  if (loading) return <main className="p-6">Loading properties...</main>;

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Manager Properties</h1>
        <p className="text-sm text-gray-500">Portfolio properties and unit inventory.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Properties</p><p className="text-xl font-semibold">{properties.length}</p></div>
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Total Units</p><p className="text-xl font-semibold">{totalUnits}</p></div>
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Selected</p><p className="text-xl font-semibold">{selected?.name || "-"}</p></div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_2fr]">
        <aside className="rounded border">
          <h2 className="border-b px-4 py-3 text-sm font-medium">Properties</h2>
          <ul className="max-h-[32rem] divide-y overflow-y-auto">
            {properties.length === 0 ? <li className="p-4 text-sm text-gray-500">No properties found.</li> : properties.map((p) => (
              <li key={p.id}><button className={`w-full px-4 py-3 text-left text-sm ${selected?.id === p.id ? "bg-gray-100" : "hover:bg-gray-50"}`} onClick={() => setSelected(p)}><p className="font-medium">{p.name}</p><p className="text-xs text-gray-500">{[p.address, p.city, p.state].filter(Boolean).join(", ") || "Address not set"}</p></button></li>
            ))}
          </ul>
        </aside>

        <section className="rounded border p-4">
          {selected ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">{selected.name}</h2>
                <p className="text-sm text-gray-500">{[selected.address, selected.city, selected.state].filter(Boolean).join(", ") || "Address not set"}</p>
                <p className="text-sm text-gray-500">Type: {selected.propertyType || "Property"} · Units: {selected.unitCount || selected.units?.length || 0}</p>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Units</h3>
                {!selected.units || selected.units.length === 0 ? <p className="text-sm text-gray-500">No unit details in payload.</p> : (
                  <div className="space-y-2">{selected.units.map((u) => <div key={u.id} className="flex items-center justify-between rounded border p-3 text-sm"><span>{u.name} · {u.status || "UNKNOWN"}</span><span>{u.rent ? fmt(u.rent) : "Rent TBD"}</span></div>)}</div>
                )}
              </div>
            </div>
          ) : <p className="text-sm text-gray-500">Select a property.</p>}
        </section>
      </div>
    </main>
  );
}
