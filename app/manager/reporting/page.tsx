"use client";

import { useEffect, useState } from "react";
import { getReporting } from "@/lib/api";

type ReportType = "rent-roll" | "profit-loss" | "maintenance-analytics" | "vacancy-rate" | "payment-history" | "manual-payments-summary" | "manual-charges-summary";

export default function ManagerReportingPage() {
  const [type, setType] = useState<ReportType>("rent-roll");
  const [propertyId, setPropertyId] = useState("");
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
      const q = new URLSearchParams();
      if (propertyId) q.append("propertyId", propertyId);
      if (startDate) q.append("startDate", startDate);
      if (endDate) q.append("endDate", endDate);
      const d = await getReporting(type, q.toString(), token);
      setData(d);
    } catch (e: any) {
      setError(e?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [type, startDate, endDate, propertyId]);

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Manager Reporting</h1>
        <p className="text-sm text-gray-500">Financial and operational report snapshots.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="flex flex-wrap gap-3">
        <select className="rounded border px-3 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value as ReportType)}>
          <option value="rent-roll">Rent Roll</option>
          <option value="profit-loss">Profit & Loss</option>
          <option value="maintenance-analytics">Maintenance Analytics</option>
          <option value="vacancy-rate">Vacancy Rate</option>
          <option value="payment-history">Payment History</option>
          <option value="manual-payments-summary">Manual Payments Summary</option>
          <option value="manual-charges-summary">Manual Charges Summary</option>
        </select>
        <input className="rounded border px-3 py-2 text-sm" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input className="rounded border px-3 py-2 text-sm" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <input className="rounded border px-3 py-2 text-sm" placeholder="Property ID (optional)" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} />
      </section>

      <section className="rounded border p-4">
        {loading ? <p className="text-sm text-gray-500">Loading report...</p> : (
          <pre className="max-h-[38rem] overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(data, null, 2)}</pre>
        )}
      </section>
    </main>
  );
}
