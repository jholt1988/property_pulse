"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { getReporting } from "@/lib/api";

export default function ManagerAnalyticsPage() {
  const [propertyId, setPropertyId] = useState("");
  const [upgradeCost, setUpgradeCost] = useState(50000);
  const [rentBump, setRentBump] = useState(150);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = useCallback(async () => {
    if (!propertyId) {
      setError("Please enter a Property ID to simulate.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
      const q = new URLSearchParams();
      q.append("propertyId", propertyId);
      q.append("upgradeCost", upgradeCost.toString());
      q.append("rentBump", rentBump.toString());
      
      const res = await fetch(`http://localhost:3001/reporting/analytics/capex?${q.toString()}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch simulation");
      const d = await res.json();
      setData(d);
    } catch (e: any) {
      setError(e?.message || "Failed to load simulation");
    } finally {
      setLoading(false);
    }
  }, [propertyId, upgradeCost, rentBump]);

  return (
    <main className="space-y-6 p-6 max-w-5xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Portfolio Capital Allocation Deep-Dive</h1>
           <p className="text-sm text-gray-500 mt-1">Algorithmic Capital Expenditure & ROI Simulation Tool</p>
        </div>
        <Link href="/manager/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">← Back to Dashboard</Link>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="col-span-1 rounded-xl bg-white border border-gray-200 shadow-sm p-5 space-y-6">
             <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide border-b pb-2">Simulation Parameters</h2>
             
             <div className="space-y-3">
                 <label className="block text-sm font-medium text-gray-700">Target Property ID</label>
                 <input 
                    placeholder="Enter Property UUID..."
                    className="w-full rounded border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={propertyId} 
                    onChange={(e) => setPropertyId(e.target.value)} 
                 />
             </div>

             <div className="space-y-3">
                 <div className="flex justify-between">
                     <label className="block text-sm font-medium text-gray-700">Capital Improvement Cost</label>
                     <span className="text-sm font-semibold text-indigo-700">${upgradeCost.toLocaleString()}</span>
                 </div>
                 <input 
                    type="range"
                    min="1000"
                    max="250000"
                    step="1000"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                    value={upgradeCost} 
                    onChange={(e) => setUpgradeCost(Number(e.target.value))} 
                 />
             </div>

             <div className="space-y-3">
                 <div className="flex justify-between">
                     <label className="block text-sm font-medium text-gray-700">Expected Rent Premium (per unit/mo)</label>
                     <span className="text-sm font-semibold text-green-600">+${rentBump}</span>
                 </div>
                 <input 
                    type="range"
                    min="25"
                    max="500"
                    step="25"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500" 
                    value={rentBump} 
                    onChange={(e) => setRentBump(Number(e.target.value))} 
                 />
             </div>

             <button 
                onClick={runSimulation}
                disabled={loading}
                className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-medium shadow-md hover:bg-gray-800 transition-all disabled:bg-gray-400"
             >
                 {loading ? 'Running Monte Carlo...' : 'Run Simulation'}
             </button>
          </section>

          <section className="col-span-1 md:col-span-2">
             {!data ? (
                <div className="h-full min-h-[300px] border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50/50">
                    <p className="text-gray-400 text-sm font-medium">Configure parameters and hit Run to view projections</p>
                </div>
             ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Internal Rate of Return (IRR) Projection Bounds</h3>
                        <p className="text-xs text-gray-500 mb-6">Generated across {data.simulatedTrials} randomized holding vacancy and damage periods.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {["year1", "year3", "year5"].map((yearKey) => (
                               <div key={yearKey} className="border rounded-lg p-4 bg-gray-50/50 relative overflow-hidden">
                                   <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l"></div>
                                   <p className="text-xs font-semibold text-gray-500 uppercase">{yearKey.toUpperCase()} Hold</p>
                                   <p className={`text-2xl font-bold mt-2 ${(data.expectedIRR[yearKey].median * 100) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                       {data.expectedIRR[yearKey].median > 0 ? '+' : ''}{(data.expectedIRR[yearKey].median * 100).toFixed(1)}%
                                   </p>
                                   <div className="mt-3 flex justify-between text-[10px] text-gray-400 font-medium">
                                       <span>Low: {(data.expectedIRR[yearKey].low * 100).toFixed(1)}%</span>
                                       <span>High: {(data.expectedIRR[yearKey].high * 100).toFixed(1)}%</span>
                                   </div>
                               </div>
                           ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Estimated Payback Period</p>
                                <p className="text-xl font-bold text-gray-800 mt-1">{data.paybackPeriodMonths} <span className="text-sm font-medium text-gray-500 relative -top-0.5">Months</span></p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Model Confidence</p>
                                <p className="text-xl font-bold text-gray-800 mt-1">{(data.confidenceScore * 100).toFixed(0)}<span className="text-sm font-medium text-gray-500 relative -top-0.5">%</span></p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
             )}
          </section>
      </div>
    </main>
  );
}
