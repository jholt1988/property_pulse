"use client";

import { useEffect, useState } from "react";
import { getScheduleExpirations, getScheduleSummary, getScheduleThisMonth, getScheduleThisWeek, getScheduleToday } from "@/lib/api";

export default function ManagerSchedulePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
      const [summary, today, week, month, expirations] = await Promise.all([
        getScheduleSummary(token),
        getScheduleToday(token),
        getScheduleThisWeek(token),
        getScheduleThisMonth(token),
        getScheduleExpirations(token),
      ]);
      setData({ summary, today, week, month, expirations });
    } catch (e: any) {
      setError(e?.message || "Failed to load schedule data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Schedule</h1>
        <p className="text-sm text-gray-500">Portfolio timeline: today, this week/month, and expirations.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <article className="rounded border p-4"><h2 className="font-medium">Summary</h2><pre className="mt-2 max-h-64 overflow-auto text-xs">{loading ? "Loading..." : JSON.stringify(data.summary, null, 2)}</pre></article>
        <article className="rounded border p-4"><h2 className="font-medium">Today</h2><pre className="mt-2 max-h-64 overflow-auto text-xs">{loading ? "Loading..." : JSON.stringify(data.today, null, 2)}</pre></article>
        <article className="rounded border p-4"><h2 className="font-medium">Expirations</h2><pre className="mt-2 max-h-64 overflow-auto text-xs">{loading ? "Loading..." : JSON.stringify(data.expirations, null, 2)}</pre></article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded border p-4"><h2 className="font-medium">This Week</h2><pre className="mt-2 max-h-80 overflow-auto text-xs">{loading ? "Loading..." : JSON.stringify(data.week, null, 2)}</pre></article>
        <article className="rounded border p-4"><h2 className="font-medium">This Month</h2><pre className="mt-2 max-h-80 overflow-auto text-xs">{loading ? "Loading..." : JSON.stringify(data.month, null, 2)}</pre></article>
      </section>
    </main>
  );
}
