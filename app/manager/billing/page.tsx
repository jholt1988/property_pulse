"use client";

import { useEffect, useState } from "react";
import { getAutopayNeedsAuth, getConnectedAccount, getPlanCycles, getPricingSnapshots, runBilling } from "@/lib/api";

export default function ManagerBillingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>({});
  const [running, setRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
      const [connectedAccount, needsAuthAttempts, planCycles, pricingSnapshots] = await Promise.all([
        getConnectedAccount(token),
        getAutopayNeedsAuth(token),
        getPlanCycles(token),
        getPricingSnapshots(token),
      ]);
      setData({ connectedAccount, needsAuthAttempts, planCycles, pricingSnapshots });
    } catch (e: any) {
      setError(e?.message || "Failed to load billing ops data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const triggerBillingRun = async () => {
    setRunning(true);
    setError(null);
    try {
      const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
      await runBilling({ dryRun: true }, token);
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to trigger billing run");
    } finally {
      setRunning(false);
    }
  };

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Billing Ops</h1>
        <p className="text-sm text-gray-500">Connected account, autopay exceptions, plan cycles, and pricing snapshots.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="flex gap-3">
        <button className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-60" disabled={running} onClick={triggerBillingRun}>
          {running ? "Running dry-run..." : "Run Billing (Dry Run)"}
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded border p-4">
          <h2 className="font-medium">Connected Account</h2>
          <pre className="mt-3 max-h-64 overflow-auto text-xs">{loading ? "Loading..." : JSON.stringify(data.connectedAccount, null, 2)}</pre>
        </article>
        <article className="rounded border p-4">
          <h2 className="font-medium">Autopay Needs Auth</h2>
          <pre className="mt-3 max-h-64 overflow-auto text-xs">{loading ? "Loading..." : JSON.stringify(data.needsAuthAttempts, null, 2)}</pre>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded border p-4">
          <h2 className="font-medium">Plan Cycles</h2>
          <pre className="mt-3 max-h-64 overflow-auto text-xs">{loading ? "Loading..." : JSON.stringify(data.planCycles, null, 2)}</pre>
        </article>
        <article className="rounded border p-4">
          <h2 className="font-medium">Pricing Snapshots</h2>
          <pre className="mt-3 max-h-64 overflow-auto text-xs">{loading ? "Loading..." : JSON.stringify(data.pricingSnapshots, null, 2)}</pre>
        </article>
      </section>
    </main>
  );
}
