"use client";

import { useEffect, useMemo, useState } from "react";
import { createMaintenanceRequest, getMaintenanceRequests, type MaintenanceRequest } from "@/lib/api";

export default function TenantMaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<MaintenanceRequest["priority"]>("MEDIUM");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
      const list = (await getMaintenanceRequests(token)).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setRequests(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      inProgress: requests.filter((r) => r.status === "IN_PROGRESS").length,
      completed: requests.filter((r) => r.status === "COMPLETED").length,
    };
  }, [requests]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
      const created = await createMaintenanceRequest({ title: title.trim(), description: description.trim(), priority }, token);
      setRequests((prev) => [created, ...prev]);
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
    } catch (e: any) {
      setError(e?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Maintenance Requests</h1>
        <p className="text-sm text-gray-500">Submit and track maintenance issues for your unit.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded border p-3"><p className="text-xs text-gray-500">Total</p><p className="text-xl font-semibold">{stats.total}</p></div>
        <div className="rounded border p-3"><p className="text-xs text-gray-500">Pending</p><p className="text-xl font-semibold">{stats.pending}</p></div>
        <div className="rounded border p-3"><p className="text-xs text-gray-500">In Progress</p><p className="text-xl font-semibold">{stats.inProgress}</p></div>
        <div className="rounded border p-3"><p className="text-xs text-gray-500">Completed</p><p className="text-xl font-semibold">{stats.completed}</p></div>
      </section>

      <section className="rounded border p-4">
        <h2 className="mb-3 font-medium">Submit New Request</h2>
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full rounded border px-3 py-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea className="w-full rounded border px-3 py-2" placeholder="Describe the issue" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />
          <select className="rounded border px-3 py-2" value={priority} onChange={(e) => setPriority(e.target.value as MaintenanceRequest["priority"])}>
            <option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="EMERGENCY">EMERGENCY</option>
          </select>
          <div><button className="rounded bg-black px-4 py-2 text-white disabled:opacity-50" disabled={submitting}>{submitting ? "Submitting..." : "Submit Request"}</button></div>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Requests</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-gray-500">No maintenance requests found.</p>
        ) : (
          requests.map((r) => (
            <article key={String(r.id)} className="rounded border p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium">#{r.id} {r.title}</h3>
                <span className="text-xs">{r.status} · {r.priority}</span>
              </div>
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{r.description}</p>
              <p className="mt-2 text-xs text-gray-500">Created: {new Date(r.createdAt).toLocaleString()}</p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
