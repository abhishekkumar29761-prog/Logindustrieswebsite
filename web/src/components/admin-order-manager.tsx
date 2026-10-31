"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { adminRequest, getAdminToken, getServerAdminToken, subscribeToAdminAuth } from "@/lib/admin-api";

type AdminOrder = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
  order_items: { product_name: string; quantity: number }[];
};

export function AdminOrderManager() {
  const token = useSyncExternalStore(subscribeToAdminAuth, getAdminToken, getServerAdminToken);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    adminRequest<{ items: AdminOrder[] }>("/api/admin/orders", token)
      .then((result) => setOrders(result.items))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load orders."));
  }, [token]);

  async function changeStatus(orderId: string, status: string) {
    if (!token) return;
    try {
      const result = await adminRequest<{ item: { status: string } }>(`/api/admin/orders/${encodeURIComponent(orderId)}`, token, {
        method: "PATCH", body: JSON.stringify({ status }),
      });
      setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status: result.item.status } : order));
      setError("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not update order."); }
  }

  if (!token) return <section className="flex min-h-80 flex-col items-center justify-center border border-slate-200 bg-white px-6 py-12 text-center"><ClipboardList className="h-9 w-9 text-slate-400" /><h2 className="mt-4 text-lg font-semibold text-slate-950">Sign in to manage orders</h2><p className="mt-2 max-w-md text-sm text-slate-600">An admin account and connected Supabase database are required to view or update customer orders.</p><Link href="/admin/login" className="mt-5 inline-flex min-h-10 items-center bg-[#102b43] px-4 text-sm font-semibold text-white">Admin sign in</Link></section>;

  return (
    <section className="border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5"><h2 className="text-lg font-bold text-slate-950">Customer orders</h2><p className="mt-1 text-sm text-slate-500">{orders.length} orders</p></div>
      {error && <p role="alert" className="mb-4 border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
      {!orders.length ? <div className="py-12 text-center"><ClipboardList className="mx-auto h-9 w-9 text-slate-400" /><p className="mt-3 text-sm text-slate-600">No orders yet, or the order list could not be loaded.</p></div> : <div className="divide-y divide-slate-200">
        {orders.map((order) => <article key={order.id} className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_160px_180px] md:items-center">
          <div><p className="font-semibold text-slate-950">{order.order_number}</p><p className="mt-1 text-xs text-slate-500">{new Date(order.created_at).toLocaleString("en-IN")}</p><p className="mt-2 text-sm text-slate-600">{order.order_items.map((item) => `${item.product_name} × ${item.quantity}`).join(", ")}</p></div>
          <div className="text-sm"><p className="font-bold text-slate-900">₹{Number(order.total).toLocaleString("en-IN")}</p><p className="mt-1 text-xs text-slate-500">Payment: {order.payment_status}</p></div>
          <label className="text-xs font-medium text-slate-500">Order status<select value={order.status} onChange={(event) => changeStatus(order.id, event.target.value)} className="mt-1.5 w-full border border-slate-300 bg-white px-2.5 py-2 text-sm font-semibold text-slate-800"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></label>
        </article>)}
      </div>}
    </section>
  );
}