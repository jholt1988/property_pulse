"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDashboardMetrics } from "@/lib/api";

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);

export default function ManagerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
        const d = await getDashboardMetrics(token);
        setData(d);
      } catch (e: any) {
        setError(e?.message || "Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const collectionRate = useMemo(() => {
    const m = data?.financials?.monthlyRevenue || 0;
    const c = data?.financials?.collectedThisMonth || 0;
    return m > 0 ? Math.round((c / m) * 100) : 0;
  }, [data]);

  if (loading) return <main className="p-6">Loading manager dashboard...</main>;

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Manager Dashboard</h1>
        <p className="text-sm text-gray-500">Portfolio overview and quick actions.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Occupancy</p><p className="text-xl font-semibold">{data?.occupancy?.percentage ?? 0}%</p><p className="text-sm text-gray-500">{data?.occupancy?.occupied ?? 0}/{data?.occupancy?.total ?? 0} occupied</p></div>
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Monthly Revenue</p><p className="text-xl font-semibold">{fmt(data?.financials?.monthlyRevenue ?? 0)}</p><p className="text-sm text-gray-500">{collectionRate}% collected</p></div>
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Maintenance</p><p className="text-xl font-semibold">{data?.maintenance?.total ?? 0}</p><p className="text-sm text-gray-500">{data?.maintenance?.pending ?? 0} pending · {data?.maintenance?.overdue ?? 0} overdue</p></div>
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Applications</p><p className="text-xl font-semibold">{data?.applications?.total ?? 0}</p><p className="text-sm text-gray-500">{data?.applications?.pending ?? 0} pending</p></div>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link href="/manager/properties" className="rounded bg-black px-4 py-2 text-sm text-white">Properties</Link>
        <Link href="/manager/leases" className="rounded border px-4 py-2 text-sm">Leases</Link>
        <Link href="/manager/applications" className="rounded border px-4 py-2 text-sm">Applications</Link>
        <Link href="/manager/reporting" className="rounded border px-4 py-2 text-sm">Reporting</Link>
      </section>
    </main>
  );
}
