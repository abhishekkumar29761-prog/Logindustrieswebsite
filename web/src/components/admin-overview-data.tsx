"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";

import { adminRequest, getAdminToken, getServerAdminToken, subscribeToAdminAuth } from "@/lib/admin-api";
import { categories, products } from "@/lib/mock-data";

type Summary = { products: number; categories: number; orders: number; paidRevenue: number; currency: string };

export function AdminOverviewData() {
  const token = useSyncExternalStore(subscribeToAdminAuth, getAdminToken, getServerAdminToken);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    adminRequest<{ products: number; categories: number; orders: number; paidRevenue: number; currency: string }>("/api/admin/summary", token)
      .then(setSummary)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load store summary."));
  }, [token]);

  const values = [
    { label: "Active products", value: summary ? String(summary.products) : String(products.length) },
    { label: "Collections", value: summary ? String(summary.categories) : String(categories.length) },
    { label: "Orders", value: summary ? String(summary.orders) : "Not connected" },
    { label: "Paid revenue", value: summary ? `₹${Number(summary.paidRevenue).toLocaleString("en-IN")}` : "Not connected" },
  ];

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {values.map((item) => <div key={item.label} className="border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{item.label}</p><p className="mt-3 text-2xl font-bold text-slate-950">{item.value}</p></div>)}
      </div>
      {error ? <p role="alert" className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</p> : !summary && <p className="border border-slate-200 bg-white p-4 text-sm text-slate-600">Preview catalog values shown. Sign in with an admin account and configure Supabase to load live numbers.</p>}
      <div className="border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="text-lg font-bold text-slate-950">Store management</h2><p className="mt-1 text-sm text-slate-600">Review products and customer orders.</p></div>
          <div className="flex gap-3"><Link href="/admin/products" className="inline-flex min-h-10 items-center bg-[#102b43] px-4 text-sm font-semibold text-white hover:bg-cyan-900">Manage products</Link><Link href="/admin/orders" className="inline-flex min-h-10 items-center border border-slate-300 px-4 text-sm font-semibold text-slate-800 hover:border-slate-500">View orders</Link></div>
        </div>
      </div>
    </section>
  );
}