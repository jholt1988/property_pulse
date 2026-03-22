"use client";

import { useEffect, useMemo, useState } from "react";
import { getInvoices, getPaymentHistory, getPaymentMethods, type Invoice, type Payment, type PaymentMethod } from "@/lib/api";

const norm = <T,>(data: any, keys: string[]): T[] => {
  if (Array.isArray(data)) return data as T[];
  for (const k of keys) if (Array.isArray(data?.[k])) return data[k] as T[];
  return [];
};

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

export default function TenantPaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [history, setHistory] = useState<Payment[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1];
        const [i, h, m] = await Promise.all([
          getInvoices(token),
          getPaymentHistory(token),
          getPaymentMethods(token),
        ]);
        setInvoices(norm<Invoice>(i, ["invoices", "data", "items"]));
        setHistory(norm<Payment>(h, ["payments", "data", "items"]));
        setMethods(norm<PaymentMethod>(m, ["paymentMethods", "data", "items"]));
      } catch (e: any) {
        setError(e?.message || "Failed to load payment data");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const openInvoices = useMemo(() => invoices.filter((x) => String(x.status).toUpperCase() !== "PAID"), [invoices]);
  const totalDue = useMemo(() => openInvoices.reduce((s, x) => s + (x.amount || 0), 0), [openInvoices]);

  if (loading) return <main className="p-6">Loading payments...</main>;

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Payments & Billing</h1>
        <p className="text-sm text-gray-500">Invoices, methods, and payment history.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Balance due</p><p className="text-xl font-semibold">{fmt(totalDue)}</p></div>
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Open invoices</p><p className="text-xl font-semibold">{openInvoices.length}</p></div>
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Saved methods</p><p className="text-xl font-semibold">{methods.length}</p></div>
      </section>

      <section className="rounded border">
        <h2 className="border-b px-4 py-3 font-medium">Invoices</h2>
        <div className="divide-y">
          {invoices.length === 0 ? <p className="p-4 text-sm text-gray-500">No invoices found.</p> : invoices.map((i) => (
            <div key={i.id} className="flex items-center justify-between p-4 text-sm">
              <div>#{i.id} · {i.description || "Invoice"}</div><div>{new Date(i.dueDate).toLocaleDateString()} · <b>{fmt(i.amount)}</b> · {i.status}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded border">
        <h2 className="border-b px-4 py-3 font-medium">Payment History</h2>
        <div className="divide-y">
          {history.length === 0 ? <p className="p-4 text-sm text-gray-500">No payment history.</p> : history.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4 text-sm">
              <div>Payment #{p.id}</div><div>{new Date(p.paymentDate).toLocaleString()} · <b>{fmt(p.amount)}</b> · {p.status}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
