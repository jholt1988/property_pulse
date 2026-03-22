"use client";

import { useEffect, useMemo, useState } from "react";
import { getRentalApplications } from "@/lib/api";

const list = (d: any) => (Array.isArray(d) ? d : d?.data || d?.items || d?.applications || []);
const money = (n?: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

export default function ManagerApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [termsFilter, setTermsFilter] = useState<"all" | "accepted" | "missing">("all");
  const [privacyFilter, setPrivacyFilter] = useState<"all" | "accepted" | "missing">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
        const d = await getRentalApplications(token);
        setApps(list(d));
      } catch (e: any) {
        setError(e?.message || "Failed to load rental applications");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const stats = useMemo(() => ({
    total: apps.length,
    pending: apps.filter((a) => a.status === "PENDING").length,
    approved: apps.filter((a) => a.status === "APPROVED").length,
    rejected: apps.filter((a) => a.status === "REJECTED").length,
  }), [apps]);

  const filtered = useMemo(() => apps.filter((a) => {
    const t = !!a.termsAcceptedAt;
    const p = !!a.privacyAcceptedAt;
    if (termsFilter === "accepted" && !t) return false;
    if (termsFilter === "missing" && t) return false;
    if (privacyFilter === "accepted" && !p) return false;
    if (privacyFilter === "missing" && p) return false;
    return true;
  }), [apps, termsFilter, privacyFilter]);

  if (loading) return <main className="p-6">Loading applications...</main>;

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Manager Applications</h1>
        <p className="text-sm text-gray-500">Review and triage rental applications.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Total</p><p className="text-xl font-semibold">{stats.total}</p></div>
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Pending</p><p className="text-xl font-semibold">{stats.pending}</p></div>
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Approved</p><p className="text-xl font-semibold">{stats.approved}</p></div>
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Rejected</p><p className="text-xl font-semibold">{stats.rejected}</p></div>
      </section>

      <section className="flex flex-wrap gap-3 text-xs">
        <label>Terms <select className="rounded border px-2 py-1" value={termsFilter} onChange={(e) => setTermsFilter(e.target.value as any)}><option value="all">All</option><option value="accepted">Accepted</option><option value="missing">Missing</option></select></label>
        <label>Privacy <select className="rounded border px-2 py-1" value={privacyFilter} onChange={(e) => setPrivacyFilter(e.target.value as any)}><option value="all">All</option><option value="accepted">Accepted</option><option value="missing">Missing</option></select></label>
        <span className="self-center text-gray-500">Showing {filtered.length} of {apps.length}</span>
      </section>

      <section className="space-y-3">
        {filtered.length === 0 ? <p className="text-sm text-gray-500">No applications found.</p> : filtered.map((a) => (
          <article key={a.id} className="rounded border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{a.fullName || "Applicant"}</h2>
                <p className="text-sm text-gray-500">{a.email || "-"} · {a.phoneNumber || "No phone"}</p>
                <p className="text-xs text-gray-500">{a.property?.name || "Property"} · {a.unit?.name || "Unit"}</p>
              </div>
              <div className="text-right text-sm">
                <p>{a.status || "PENDING"}</p>
                <button className="text-xs text-indigo-600" onClick={() => setExpanded(expanded === a.id ? null : a.id)}>{expanded === a.id ? "Hide" : "View"} details</button>
              </div>
            </div>
            {expanded === a.id && (
              <div className="mt-3 grid gap-3 text-xs md:grid-cols-3">
                <div><p className="text-gray-500">Income</p><p>{money(a.income)}</p></div>
                <div><p className="text-gray-500">Credit score</p><p>{a.creditScore ?? "-"}</p></div>
                <div><p className="text-gray-500">Employment</p><p>{a.employmentStatus ?? "-"}</p></div>
                <div><p className="text-gray-500">Terms</p><p>{a.termsAcceptedAt ? "Accepted" : "Missing"}</p></div>
                <div><p className="text-gray-500">Privacy</p><p>{a.privacyAcceptedAt ? "Accepted" : "Missing"}</p></div>
                <div><p className="text-gray-500">Submitted</p><p>{a.createdAt ? new Date(a.createdAt).toLocaleString() : "-"}</p></div>
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
