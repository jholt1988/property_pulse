"use client";

import { useEffect, useState } from "react";
import { generateRentRecommendations, getPendingRentRecommendations, getRecentRentRecommendations, getRentRecommendationStats } from "@/lib/api";

export default function ManagerRentOptimizationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>({});
  const [unitId, setUnitId] = useState("");
  const [running, setRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
      const [stats, pending, recent] = await Promise.all([
        getRentRecommendationStats(token),
        getPendingRentRecommendations(token),
        getRecentRentRecommendations(token),
      ]);
      setData({ stats, pending, recent });
    } catch (e: any) {
      setError(e?.message || "Failed to load rent optimization data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const generate = async () => {
    if (!unitId.trim()) return;
    setRunning(true);
    setError(null);
    try {
      const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
      await generateRentRecommendations({ unitId: unitId.trim() }, token);
      setUnitId("");
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to generate recommendation");
    } finally {
      setRunning(false);
    }
  };

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Rent Optimization</h1>
        <p className="text-sm text-gray-500">Recommendation stats, pending queue, and targeted generation.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="flex flex-wrap items-center gap-3 rounded border p-4">
        <input
          className="rounded border px-3 py-2 text-sm"
          placeholder="Unit ID"
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
        />
        <button className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-60" onClick={generate} disabled={running || !unitId.trim()}>
          {running ? "Generating..." : "Generate Recommendation"}
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded border p-4 md:col-span-1">
          <h2 className="font-medium">Stats</h2>
          <pre className="mt-3 max-h-64 overflow-auto text-xs">{loading ? "Loading..." : JSON.stringify(data.stats, null, 2)}</pre>
        </article>
        <article className="rounded border p-4 md:col-span-1">
          <h2 className="font-medium">Pending</h2>
          <pre className="mt-3 max-h-64 overflow-auto text-xs">{loading ? "Loading..." : JSON.stringify(data.pending, null, 2)}</pre>
        </article>
        <article className="rounded border p-4 md:col-span-1">
          <h2 className="font-medium">Recent</h2>
          <pre className="mt-3 max-h-64 overflow-auto text-xs">{loading ? "Loading..." : JSON.stringify(data.recent, null, 2)}</pre>
        </article>
      </section>
    </main>
  );
}
