"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { PortfolioHeatmapRow } from "@/lib/api/manager";

const tierClasses: Record<PortfolioHeatmapRow["tier"], string> = {
  HEALTHY: "border-emerald-400/30 bg-emerald-500/10",
  WATCH: "border-amber-400/30 bg-amber-500/10",
  CRITICAL: "border-rose-400/30 bg-rose-500/10",
};

export function PortfolioHeatmap({
  rows,
  loading,
}: {
  rows: PortfolioHeatmapRow[];
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader
        title="Portfolio Health Heatmap"
        subtitle="Financial, occupancy, and sentiment signals by property"
      />
      <CardContent>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-xl border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-400">No portfolio health data is available yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((row) => (
              <div
                key={row.propertyId}
                className={`rounded-xl border p-4 ${tierClasses[row.tier]}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-white">{row.propertyName}</h3>
                    <p className="mt-1 text-xs text-slate-300">
                      {row.occupiedUnits}/{row.totalUnits} occupied
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[11px] uppercase tracking-wide text-slate-200">
                    {row.tier}
                  </span>
                </div>

                <div className="mt-4 flex items-end gap-2">
                  <div className="text-3xl font-semibold text-white">{row.compositeScore}</div>
                  <div className="pb-1 text-xs uppercase tracking-wide text-slate-300">Composite</div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-white/10 bg-black/10 p-2 text-center">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">Occ</div>
                    <div className="mt-1 text-sm font-medium text-white">{row.occupancyRate}%</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/10 p-2 text-center">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">Collect</div>
                    <div className="mt-1 text-sm font-medium text-white">{row.collectionRate}%</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/10 p-2 text-center">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">Sentiment</div>
                    <div className="mt-1 text-sm font-medium text-white">{row.maintenanceHealth}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
