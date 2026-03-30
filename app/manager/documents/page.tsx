"use client";

import { useEffect, useState } from "react";
import { deleteDocument, getDocuments, shareDocument } from "@/lib/api";

export default function ManagerDocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
      const d = await getDocuments(token);
      setDocs(Array.isArray(d) ? d : d?.data || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onDelete = async (id: string | number) => {
    try {
      const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
      await deleteDocument(id, token);
      await load();
    } catch (e: any) {
      setError(e?.message || "Delete failed");
    }
  };

  const onShare = async (id: string | number) => {
    try {
      const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
      await shareDocument(id, { sharedWithRole: "TENANT" }, token);
      await load();
    } catch (e: any) {
      setError(e?.message || "Share failed");
    }
  };

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Documents</h1>
        <p className="text-sm text-gray-500">List/share/delete documents (manager controls).</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="rounded border p-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading documents...</p>
        ) : docs.length === 0 ? (
          <p className="text-sm text-gray-500">No documents found.</p>
        ) : (
          <ul className="space-y-2">
            {docs.map((d) => (
              <li key={String(d.id)} className="flex items-center justify-between rounded border p-3">
                <div>
                  <p className="text-sm font-medium">{d.fileName || d.name || `Document ${d.id}`}</p>
                  <p className="text-xs text-gray-500">ID: {d.id}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded border px-3 py-1 text-xs" onClick={() => onShare(d.id)}>Share</button>
                  <button className="rounded border border-red-300 px-3 py-1 text-xs text-red-700" onClick={() => onDelete(d.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
