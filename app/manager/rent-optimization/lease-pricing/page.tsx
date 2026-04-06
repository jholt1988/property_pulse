"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getSeasonalPricingMatrix, type SeasonalPricingMatrix } from "@/lib/api";

const defaultUnits = [
  { id: "1", name: "Unit 1" },
  { id: "2", name: "Unit 2" },
  { id: "3", name: "Unit 3" },
];

export default function LeasePricingPage() {
  const [unitId, setUnitId] = useState(defaultUnits[0].id);
  const [baseRent, setBaseRent] = useState(1800);
  const [termMonths, setTermMonths] = useState(12);
  const [matrix, setMatrix] = useState<SeasonalPricingMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
        const data = await getSeasonalPricingMatrix(unitId, baseRent, token);
        setMatrix(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load seasonal pricing matrix");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [unitId, baseRent]);

  const visibleOptions = useMemo(() => {
    return (matrix?.options ?? []).filter((option) => option.termMonths === termMonths);
  }, [matrix, termMonths]);

  return (
    <main className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <SectionHeader
          eyebrow="Renewal Strategy"
          title="Lease Term Pricing"
          description="Compare month-by-month seasonal pricing and target the best lease window."
        />
        <Link href="/manager/rent-optimization" className="rounded border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">
          Back to Rent AI
        </Link>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader title="Inputs" subtitle="Unit, rent baseline, and target term" />
          <CardContent className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Unit</span>
              <select
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
              >
                {defaultUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Base Rent</span>
              <input
                type="range"
                min={900}
                max={4000}
                step={25}
                value={baseRent}
                onChange={(e) => setBaseRent(Number(e.target.value))}
                className="w-full"
              />
              <div className="mt-2 text-sm text-white">${baseRent}</div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Lease Term</span>
              <input
                type="range"
                min={6}
                max={18}
                step={3}
                value={termMonths}
                onChange={(e) => setTermMonths(Number(e.target.value))}
                className="w-full"
              />
              <div className="mt-2 text-sm text-white">{termMonths} months</div>
            </label>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="Seasonal Pricing Matrix" subtitle="Recommended pricing by start month" />
          <CardContent>
            {loading ? (
              <p className="text-sm text-slate-400">Generating pricing scenarios...</p>
            ) : visibleOptions.length === 0 ? (
              <p className="text-sm text-slate-400">No pricing options available.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleOptions.map((option) => (
                  <div
                    key={`${option.targetStartMonth}-${option.termMonths}`}
                    className={`rounded-xl border p-4 ${
                      option.recommended
                        ? "border-indigo-400/30 bg-indigo-500/10"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-white">{option.targetStartMonthLabel}</h3>
                        <p className="mt-1 text-xs text-slate-400">{option.termMonths}-month term</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-semibold text-white">${option.monthlyRent}</div>
                        <div className={`text-xs ${option.seasonalAdjustmentPercent >= 0 ? "text-emerald-300" : "text-amber-300"}`}>
                          {option.seasonalAdjustmentPercent >= 0 ? "+" : ""}
                          {option.seasonalAdjustmentPercent}%
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-300">{option.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
