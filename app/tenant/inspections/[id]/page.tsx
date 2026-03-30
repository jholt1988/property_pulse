"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getInspectionById, getInspectionRequests, patchRoomItems, startInspection, updateInspectionStatus, uploadInspectionItemPhoto } from "@/lib/api";

type InspectionCondition = "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "DAMAGED" | "NON_FUNCTIONAL";

const label = (s: string) => String(s || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());

export default function TenantInspectionDetailPage() {
  const params = useParams<{ id: string }>();
  const inspectionId = Number(params.id);
  const token = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1] : undefined;

  const [inspection, setInspection] = useState<any | null>(null);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingRoomId, setSavingRoomId] = useState<number | null>(null);
  const [draftByItemId, setDraftByItemId] = useState<Record<number, { requiresAction: boolean; notes: string; condition: InspectionCondition | "" }>>({});
  const [photoDraftByItemId, setPhotoDraftByItemId] = useState<Record<number, { url: string; caption: string }>>({});

  const load = useCallback(async () => {
    if (!Number.isFinite(inspectionId)) return;
    setLoading(true);
    setError(null);
    try {
      const [d, req] = await Promise.all([getInspectionById(inspectionId, token), getInspectionRequests(token).catch(() => [])]);
      setInspection(d?.data ?? d);
      const reqs = Array.isArray(req) ? req : req?.data || [];
      const matching = reqs
        .filter((r: any) => Number(r?.startedInspectionId ?? -1) === inspectionId || (r?.type === (d?.type || d?.data?.type) && r?.unitId === (d?.unitId || d?.data?.unitId)))
        .sort((a: any, b: any) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());
      setRequestStatus(matching[0]?.status || null);

      const rooms = (d?.data?.rooms || d?.rooms || []) as any[];
      const next: Record<number, { requiresAction: boolean; notes: string; condition: InspectionCondition | "" }> = {};
      for (const r of rooms) for (const it of (r?.checklistItems || [])) next[Number(it.id)] = { requiresAction: !!it.requiresAction, notes: String(it.notes || ""), condition: (it.condition as InspectionCondition | "") || "" };
      setDraftByItemId(next);
    } catch (e: any) {
      setError(e?.message || "Failed to load inspection");
    } finally {
      setLoading(false);
    }
  }, [inspectionId, token]);

  useEffect(() => { load(); }, [load]);

  const status = String(inspection?.status || "");
  const canStart = status === "SCHEDULED" && requestStatus === "APPROVED";
  const canComplete = status === "IN_PROGRESS";
  const locked = status !== "IN_PROGRESS" && status !== "COMPLETED";

  const saveRoom = async (roomId: number) => {
    const room = (inspection?.rooms || []).find((r: any) => Number(r.id) === roomId);
    if (!room) return;
    setSavingRoomId(roomId);
    setError(null);
    try {
      const items = (room.checklistItems || []).map((it: any) => {
        const d = draftByItemId[Number(it.id)] || { requiresAction: !!it.requiresAction, notes: String(it.notes || ""), condition: ((it.condition as InspectionCondition | "") || "") };
        return { itemId: Number(it.id), requiresAction: !!d.requiresAction, condition: d.condition || undefined, notes: String(d.notes || "") };
      });
      await patchRoomItems(roomId, items, token);
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to save room");
    } finally {
      setSavingRoomId(null);
    }
  };

  const uploadPhoto = async (itemId: number) => {
    const d = photoDraftByItemId[itemId] || { url: "", caption: "" };
    if (!d.url.trim()) return setError("Photo URL is required.");
    setError(null);
    try {
      await uploadInspectionItemPhoto(itemId, { url: d.url.trim(), caption: d.caption.trim() || undefined }, token);
      setPhotoDraftByItemId((s) => ({ ...s, [itemId]: { url: "", caption: "" } }));
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to upload photo");
    }
  };

  return (
    <main className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <Link href="/tenant/inspections" className="rounded border px-3 py-1 text-sm">Back</Link>
        <span className="text-sm">Status: <b>{status || "-"}</b></span>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading inspection...</p>}
      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {!loading && inspection && (
        <section className="rounded border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Type</p>
              <p className="font-semibold">{label(inspection.type)}</p>
            </div>
            <div className="flex gap-2">
              {canStart && <button className="rounded border px-3 py-1 text-sm" onClick={async () => { try { const req = await getInspectionRequests(token); const reqs = Array.isArray(req) ? req : req?.data || []; const c = reqs.find((r: any) => r?.status === "APPROVED" && r?.type === inspection?.type && r?.unitId === inspection?.unitId); if (!c?.id) throw new Error("No approved request found"); await startInspection(Number(c.id), token); await load(); } catch (e:any){ setError(e?.message || "Failed to start inspection"); } }}>Start Inspection</button>}
              {canComplete && <button className="rounded bg-black px-3 py-1 text-sm text-white" onClick={async () => { try { await updateInspectionStatus(inspectionId, "COMPLETED", token); await load(); } catch (e:any){ setError(e?.message || "Failed to mark completed"); } }}>Mark Completed</button>}
            </div>
          </div>

          {Array.isArray(inspection.rooms) && inspection.rooms.length > 0 ? inspection.rooms.map((room: any) => (
            <article key={room.id} className="rounded border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div><p className="font-medium">{room.name}</p><p className="text-xs text-gray-500">{room.roomType}</p></div>
                <button className="rounded border px-3 py-1 text-sm disabled:opacity-50" disabled={locked || savingRoomId === Number(room.id)} onClick={() => saveRoom(Number(room.id))}>{savingRoomId === Number(room.id) ? "Saving..." : "Save"}</button>
              </div>
              {(room.checklistItems || []).map((it: any) => {
                const d = draftByItemId[Number(it.id)] || { requiresAction: !!it.requiresAction, notes: String(it.notes || ""), condition: ((it.condition as InspectionCondition | "") || "") };
                return (
                  <div key={it.id} className="rounded border p-3 space-y-2">
                    <p className="text-sm font-medium">{it.itemName}</p>
                    <div className="grid gap-2 md:grid-cols-2">
                      <select className="rounded border px-2 py-2 text-sm" disabled={locked} value={d.condition} onChange={(e) => setDraftByItemId((s) => ({ ...s, [Number(it.id)]: { ...d, condition: e.target.value as InspectionCondition | "" } }))}>
                        <option value="">Select condition</option>
                        {(["EXCELLENT","GOOD","FAIR","POOR","DAMAGED","NON_FUNCTIONAL"] as InspectionCondition[]).map((c) => <option key={c} value={c}>{label(c)}</option>)}
                      </select>
                      <select className="rounded border px-2 py-2 text-sm" disabled={locked} value={d.requiresAction ? "YES" : "NO"} onChange={(e) => setDraftByItemId((s) => ({ ...s, [Number(it.id)]: { ...d, requiresAction: e.target.value === "YES" } }))}>
                        <option value="NO">No action needed</option><option value="YES">Needs attention</option>
                      </select>
                    </div>
                    <textarea className="w-full rounded border px-2 py-2 text-sm" rows={2} disabled={locked} value={d.notes} onChange={(e) => setDraftByItemId((s) => ({ ...s, [Number(it.id)]: { ...d, notes: e.target.value } }))} placeholder="Notes" />
                    <div className="rounded border p-2 space-y-2">
                      <p className="text-xs text-gray-500">Attached photos: {(it.photos || []).length}</p>
                      <div className="grid gap-2 md:grid-cols-2">
                        <input className="rounded border px-2 py-2 text-sm" disabled={locked} placeholder="Photo URL" value={photoDraftByItemId[Number(it.id)]?.url || ""} onChange={(e) => setPhotoDraftByItemId((s) => ({ ...s, [Number(it.id)]: { ...(s[Number(it.id)] || { url: "", caption: "" }), url: e.target.value } }))} />
                        <input className="rounded border px-2 py-2 text-sm" disabled={locked} placeholder="Caption (optional)" value={photoDraftByItemId[Number(it.id)]?.caption || ""} onChange={(e) => setPhotoDraftByItemId((s) => ({ ...s, [Number(it.id)]: { ...(s[Number(it.id)] || { url: "", caption: "" }), caption: e.target.value } }))} />
                      </div>
                      <button className="rounded border px-3 py-1 text-sm disabled:opacity-50" disabled={locked} onClick={() => uploadPhoto(Number(it.id))}>Upload photo URL</button>
                    </div>
                  </div>
                );
              })}
            </article>
          )) : <p className="text-sm text-gray-500">No rooms found for this inspection.</p>}
        </section>
      )}
    </main>
  );
}
