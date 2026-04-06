"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getActionIntents, getDashboardMetrics, getPropertyLocations, resolveActionIntent } from "@/lib/api";

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);

type PropertyLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

type PropertyLocationsResponse = {
  totalProperties: number;
  mappedProperties: number;
  missingCoordinates: number;
  properties: PropertyLocation[];
};

const buildOsmEmbedUrl = (locations: PropertyLocation[]) => {
  if (!locations.length) return null;

  const lats = locations.map((location) => location.latitude);
  const lngs = locations.map((location) => location.longitude);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latPadding = Math.max((maxLat - minLat) * 0.2, 0.02);
  const lngPadding = Math.max((maxLng - minLng) * 0.2, 0.02);

  const left = minLng - lngPadding;
  const bottom = minLat - latPadding;
  const right = maxLng + lngPadding;
  const top = maxLat + latPadding;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik`;
};

type ActionIntent = {
  id: string;
  type: string;
  description: string;
  status: string;
  priority: "HIGH" | "MEDIUM" | "LOW" | string;
  raw?: any;
  createdAt: string;
};

export default function ManagerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [propertyLocations, setPropertyLocations] = useState<PropertyLocationsResponse | null>(null);
  const [actionIntents, setActionIntents] = useState<ActionIntent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
        const [d, locations, intents] = await Promise.all([
          getDashboardMetrics(token),
          getPropertyLocations(token),
          getActionIntents(token),
        ]);
        setData(d);
        setPropertyLocations(locations);
        setActionIntents(Array.isArray(intents?.intents) ? intents.intents : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const handleResolveIntent = async (id: string, action: string) => {
    try {
      const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
      await resolveActionIntent(id, action, token);
      setActionIntents((prev) => prev.filter((i) => i.id !== id));
    } catch (e: any) {
      setError(e?.message || "Failed to resolve intent");
    }
  };

  const collectionRate = useMemo(() => {
    const m = data?.financials?.monthlyRevenue || 0;
    const c = data?.financials?.collectedThisMonth || 0;
    return m > 0 ? Math.round((c / m) * 100) : 0;
  }, [data]);

  if (loading) return <main className="p-6">Loading manager dashboard...</main>;

  const mappedLocations = propertyLocations?.properties ?? [];
  const mapEmbedUrl = buildOsmEmbedUrl(mappedLocations);

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

      <section className="rounded border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Portfolio Map</p>
            <p className="text-lg font-semibold">Organization properties</p>
          </div>
          <p className="text-xs text-gray-600">{propertyLocations?.mappedProperties ?? 0} mapped / {propertyLocations?.totalProperties ?? 0} total</p>
        </div>

        {mapEmbedUrl ? (
          <>
            <div className="h-64 overflow-hidden rounded border bg-gray-50">
              <iframe
                title="Portfolio map"
                src={mapEmbedUrl}
                className="h-full w-full"
                loading="lazy"
              />
            </div>
            {(propertyLocations?.missingCoordinates ?? 0) > 0 && (
              <p className="text-xs text-amber-700">
                {propertyLocations?.missingCoordinates} properties are missing coordinates and are not shown yet.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500">No mapped property coordinates found yet.</p>
        )}
      </section>

      <section className="rounded border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Action Intents</p>
            <p className="text-lg font-semibold">Recommended next actions</p>
          </div>
          <p className="text-xs text-gray-600">{actionIntents.length} items</p>
        </div>

        {actionIntents.length > 0 ? (
          <ul className="space-y-2">
            {actionIntents.slice(0, 5).map((intent) => (
              <li key={intent.id} className="rounded border p-3 flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{intent.type}</p>
                    <span className="text-[11px] uppercase text-gray-500">{intent.priority}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{intent.description}</p>
                  
                  {intent.type === 'AI_ABSTRACTION_REVIEW' && intent.raw?.extractedFields && (
                    <div className="mt-3 bg-blue-50/50 rounded-md p-3 border border-blue-100/50">
                      <p className="text-[11px] font-semibold text-blue-800 uppercase tracking-wide mb-2">Automated Extraction Preview</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Rent</p>
                          <p className="text-sm font-medium">{fmt(intent.raw.extractedFields.monthlyRent)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Term</p>
                          <p className="text-sm font-medium">{intent.raw.extractedFields.leaseTermMonths} mos</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Start Date</p>
                          <p className="text-sm font-medium">{new Date(intent.raw.extractedFields.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Concessions</p>
                          <p className="text-xs font-medium text-gray-700 truncate" title={intent.raw.extractedFields.concessions}>{intent.raw.extractedFields.concessions}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {intent.type === 'RENEWAL_PRICING_GENERATED' && intent.raw && (
                    <div className="mt-3 bg-purple-50/50 rounded-md p-3 border border-purple-100/50">
                      <p className="text-[11px] font-semibold text-purple-800 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        Predictive Yield Matrix
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Flight Risk</p>
                          <p className={`text-sm font-medium ${intent.raw.riskLevel === 'HIGH' ? 'text-red-600' : 'text-purple-600'}`}>
                            {intent.raw.riskLevel} ({(intent.raw.churnRisk * 100).toFixed(0)}%)
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Suggested Rent</p>
                          <p className="text-sm font-medium">{fmt(intent.raw.recommendedRent)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Market Index</p>
                          <p className="text-sm font-medium">{intent.raw.marketIndex.toFixed(2)}x</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {intent.type === 'CAPITAL_ALLOCATION_INTENT' && intent.raw && (
                    <div className="mt-3 bg-slate-50/50 rounded-md p-3 border border-slate-200">
                      <p className="text-[11px] font-semibold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                        Portfolio Financial Audit
                      </p>
                      <div className="text-sm font-medium text-slate-700">
                         Net Income margin anomaly detected: <span className="text-red-600">{((intent.raw.margin || 0) * 100).toFixed(1)}%</span>.
                         Asset evaluation requested.
                      </div>
                    </div>
                  )}

                  <p className="mt-2 text-xs text-gray-500">{intent.status} · {new Date(intent.createdAt).toLocaleString()}</p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {intent.type === "AI_ABSTRACTION_REVIEW" && (
                     <>
                        <button onClick={() => handleResolveIntent(intent.id, "RESOLVED")} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded hover:bg-indigo-100 transition-colors font-medium">Commit to Ledger</button>
                        <button onClick={() => handleResolveIntent(intent.id, "DISMISSED")} className="text-xs bg-gray-50 text-gray-600 border px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">Discard</button>
                     </>
                  )}
                  {intent.type === "RENEWAL_PRICING_GENERATED" && (
                     <>
                        <button onClick={() => handleResolveIntent(intent.id, "RESOLVED")} className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded hover:bg-purple-100 transition-colors font-medium">Approve Auto-Pricing</button>
                        <button onClick={() => handleResolveIntent(intent.id, "DISMISSED")} className="text-xs bg-gray-50 text-gray-600 border px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">Override</button>
                     </>
                  )}
                  {intent.type === "QUICKBOOKS_ANOMALY" && (
                     <>
                        <button onClick={() => handleResolveIntent(intent.id, "EXECUTED")} className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded hover:bg-red-100 transition-colors">Force Sync</button>
                        <button onClick={() => handleResolveIntent(intent.id, "DISMISSED")} className="text-xs bg-gray-50 text-gray-600 border px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">Dismiss</button>
                     </>
                  )}
                  {intent.type === "CAPITAL_ALLOCATION_INTENT" && (
                     <>
                        <Link href="/manager/analytics" className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors font-medium">Launch Simulator</Link>
                        <button onClick={() => handleResolveIntent(intent.id, "DISMISSED")} className="text-xs bg-gray-50 text-gray-600 border px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">Ignore</button>
                     </>
                  )}
                  {intent.type !== "QUICKBOOKS_ANOMALY" && intent.type !== "AI_ABSTRACTION_REVIEW" && intent.type !== "RENEWAL_PRICING_GENERATED" && intent.type !== "CAPITAL_ALLOCATION_INTENT" && (
                    <button onClick={() => handleResolveIntent(intent.id, "RESOLVED")} className="text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800 transition-colors">Resolve</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No action intents available yet.</p>
        )}
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
