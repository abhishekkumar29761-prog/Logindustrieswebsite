"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { Plus, Save, X } from "lucide-react";
import Image from "next/image";

import { adminRequest, getAdminToken, getServerAdminToken, subscribeToAdminAuth } from "@/lib/admin-api";
import { categories, products as previewProducts, type Product } from "@/lib/mock-data";

type ProductResponse = { items: Product[]; count: number };

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function AdminProductManager() {
  const token = useSyncExternalStore(subscribeToAdminAuth, getAdminToken, getServerAdminToken);
  const [items, setItems] = useState<Product[]>(previewProducts);
  const [live, setLive] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  async function reload(accessToken: string) {
    const data = await adminRequest<ProductResponse>("/api/admin/products", accessToken);
    setItems(data.items);
    setLive(true);
  }

  useEffect(() => {
    if (!token) return;
    let active = true;
    adminRequest<ProductResponse>("/api/admin/products", token)
      .then((result) => {
        if (!active) return;
        setItems(result.items);
        setLive(true);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load products.");
      });
    return () => { active = false; };
  }, [token]);

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const priceText = String(data.get("price") || "").trim();
    try {
      await adminRequest("/api/admin/products", token, {
        method: "POST",
        body: JSON.stringify({
          name,
          slug: toSlug(name),
          category_slug: data.get("category_slug"),
          price: priceText ? Number(priceText) : null,
          original_price: null,
          image_url: String(data.get("image_url") || "").trim() || null,
        }),
      });
      form.reset();
      setShowCreate(false);
      setError("");
      await reload(token);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create product."); }
  }

  async function updateProduct(event: FormEvent<HTMLFormElement>, product: Product) {
    event.preventDefault();
    if (!token) return;
    const data = new FormData(event.currentTarget);
    const priceText = String(data.get("price") || "").trim();
    try {
      await adminRequest(`/api/admin/products/${encodeURIComponent(String(product.id))}`, token, {
        method: "PATCH",
        body: JSON.stringify({ name: data.get("name"), price: priceText ? Number(priceText) : null }),
      });
      setError("");
      await reload(token);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not update product."); }
  }

  async function deactivate(product: Product) {
    if (!token || !window.confirm(`Remove ${product.name} from the storefront?`)) return;
    try {
      await adminRequest(`/api/admin/products/${encodeURIComponent(String(product.id))}`, token, { method: "DELETE" });
      await reload(token);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not deactivate product."); }
  }

  return (
    <section className="border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div><h2 className="text-lg font-bold text-slate-950">{live ? "Product catalog" : "Catalog preview"}</h2><p className="mt-1 text-sm text-slate-500">{live ? `${items.length} products from the connected database.` : "Preview only until admin sign-in and Supabase are configured."}</p></div>
        {token && <button type="button" onClick={() => setShowCreate((current) => !current)} className="inline-flex min-h-10 items-center gap-2 bg-[#102b43] px-4 text-sm font-semibold text-white hover:bg-cyan-900">{showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{showCreate ? "Close" : "Add product"}</button>}
      </div>

      {error && <p role="alert" className="mb-5 border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
      {showCreate && <form onSubmit={createProduct} className="mb-6 grid gap-3 border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-600">Product name<input name="name" required maxLength={200} className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900" /></label>
        <label className="text-xs font-semibold text-slate-600">Category<select name="category_slug" required className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900">{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label>
        <label className="text-xs font-semibold text-slate-600">Price (blank = quote)<input name="price" type="number" min="0" step="0.01" className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900" /></label>
        <label className="text-xs font-semibold text-slate-600">Image URL<input name="image_url" type="url" className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900" /></label>
        <button className="inline-flex min-h-10 items-center justify-center gap-2 bg-cyan-800 px-4 text-sm font-semibold text-white hover:bg-cyan-900 sm:col-span-2"><Plus className="h-4 w-4" />Create product</button>
      </form>}

      {!items.length ? <p className="border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">No products in the catalog.</p> : <div className="divide-y divide-slate-200">
        {items.map((product) => <form key={product.id} onSubmit={(event) => updateProduct(event, product)} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_130px_auto] sm:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <Image src={product.image} alt="" width={56} height={56} unoptimized className="h-14 w-14 shrink-0 bg-slate-50 object-contain p-1" />
            <div className="min-w-0"><label className="sr-only" htmlFor={`name-${product.id}`}>Name for {product.name}</label><input id={`name-${product.id}`} name="name" defaultValue={product.name} disabled={!token} className="w-full border border-transparent bg-transparent px-1 py-1 text-sm font-semibold text-slate-900 disabled:opacity-100 enabled:border-slate-300" /><p className="px-1 text-xs text-slate-500">{product.category} · {product.active === false ? "Inactive" : "Active"}</p></div>
          </div>
          <label className="text-xs text-slate-500">Price<input name="price" type="number" min="0" step="0.01" defaultValue={product.price ?? ""} placeholder="Quote" disabled={!token} className="mt-1 w-full border border-slate-300 px-2 py-2 text-sm font-semibold text-slate-900 disabled:border-transparent disabled:bg-transparent disabled:px-0" /></label>
          {token && <div className="flex gap-2"><button type="submit" aria-label={`Save ${product.name}`} className="grid h-9 w-9 place-items-center border border-slate-300 text-slate-700 hover:border-cyan-800 hover:text-cyan-900"><Save className="h-4 w-4" /></button><button type="button" onClick={() => deactivate(product)} aria-label={`Deactivate ${product.name}`} className="h-9 border border-slate-300 px-2 text-xs font-semibold text-slate-600 hover:border-red-400 hover:text-red-700">Remove</button></div>}
        </form>)}
      </div>}
    </section>
  );
}