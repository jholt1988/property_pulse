"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getTenantDashboard, type TenantDashboardData } from "@/lib/api";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export default function TenantDashboardPage() {
  const [data, setData] = useState<TenantDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
        const raw = await getTenantDashboard(token);
        setData({
          maintenanceRequests: {
            total: raw.maintenanceRequests?.total ?? 0,
            pending: raw.maintenanceRequests?.pending ?? 0,
            inProgress: raw.maintenanceRequests?.inProgress ?? 0,
            completed: raw.maintenanceRequests?.completed ?? 0,
            urgent: raw.maintenanceRequests?.urgent ?? 0,
          },
          nextRentPayment: raw.nextRentPayment,
          lease: raw.lease,
          recentActivity: raw.recentActivity ?? [],
        });
      } catch {
        setData({
          nextRentPayment: { amount: 1500, dueDate: new Date(Date.now() + 5 * 86400000).toISOString(), isPaid: false },
          maintenanceRequests: { total: 5, pending: 1, inProgress: 2, completed: 2, urgent: 0 },
          lease: { property: "Sunset Apartments", unit: "2A", status: "ACTIVE", monthlyRent: 1500, endDate: "2025-12-31" },
          recentActivity: [],
        });
        setError("Using fallback data (API unavailable).");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const rentDueText = useMemo(() => {
    if (!data?.nextRentPayment?.dueDate) return "N/A";
    const days = Math.ceil((new Date(data.nextRentPayment.dueDate).getTime() - Date.now()) / 86400000);
    if (days <= 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `Due in ${days} days`;
  }, [data]);

  if (loading) return <main className="p-6">Loading tenant dashboard...</main>;
  if (!data) return <main className="p-6">No dashboard data available.</main>;

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Tenant Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of rent, maintenance, and lease status.</p>
        {error && <p className="mt-2 text-sm text-amber-600">{error}</p>}
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4">
          <p className="text-sm text-gray-500">Next Rent</p>
          <p className="text-xl font-semibold">{formatCurrency(data.nextRentPayment?.amount ?? 0)}</p>
          <p className="text-sm">{rentDueText}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-gray-500">Maintenance</p>
          <p className="text-xl font-semibold">{data.maintenanceRequests.total} total</p>
          <p className="text-sm">{data.maintenanceRequests.pending} pending · {data.maintenanceRequests.inProgress} in progress</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-gray-500">Lease</p>
          <p className="text-xl font-semibold">{data.lease?.status ?? "N/A"}</p>
          <p className="text-sm">{data.lease?.property ?? "-"} Unit {data.lease?.unit ?? "-"}</p>
        </div>
      </section>

      <section className="flex gap-3">
        <Link href="/tenant/maintenance" className="rounded bg-black px-4 py-2 text-white">Open Maintenance</Link>
        <Link href="/tenant/payments" className="rounded border px-4 py-2">Open Payments</Link>
        <Link href="/tenant/lease" className="rounded border px-4 py-2">Open Lease</Link>
      </section>
    </main>
  );
}
