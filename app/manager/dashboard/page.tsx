"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDashboardMetrics, getPropertyLocations } from "@/lib/api";

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

export default function ManagerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [propertyLocations, setPropertyLocations] = useState<PropertyLocationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
        const [d, locations] = await Promise.all([
          getDashboardMetrics(token),
          getPropertyLocations(token),
        ]);
        setData(d);
        setPropertyLocations(locations);
      } catch (e: any) {
        setError(e?.message || "Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

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

      <section className="flex flex-wrap gap-3">
        <Link href="/manager/properties" className="rounded bg-black px-4 py-2 text-sm text-white">Properties</Link>
        <Link href="/manager/leases" className="rounded border px-4 py-2 text-sm">Leases</Link>
        <Link href="/manager/applications" className="rounded border px-4 py-2 text-sm">Applications</Link>
        <Link href="/manager/reporting" className="rounded border px-4 py-2 text-sm">Reporting</Link>
      </section>
    </main>
  );
}
