"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2, X } from "lucide-react";

import { adminRequest, getAdminToken, getServerAdminToken, subscribeToAdminAuth } from "@/lib/admin-api";
import { categories, products as previewProducts, type Product } from "@/lib/mock-data";
import { ProductPhoto } from "@/components/product-photo";

type ProductResponse = { items: Product[]; count: number };
type UploadedImages = { items: { url: string; path: string }[] };
const maxProductImages = 50;
const uploadBatchSize = 10;

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function isStorageImage(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "kjsajbdkafuvqylpziii.supabase.co"
      && parsed.pathname.startsWith("/storage/v1/object/public/product-images/");
  } catch {
    return false;
  }
}

function ProductEditorForm({
  token,
  product,
  onSaved,
  onCancel,
  onError,
}: {
  token: string;
  product?: Product;
  onSaved: () => Promise<void>;
  onCancel?: () => void;
  onError: (message: string) => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categorySlug, setCategorySlug] = useState(product?.categorySlug ?? categories[0].slug);
  const [images, setImages] = useState<string[]>(product?.images?.length ? product.images : (product?.image ? [product.image] : []));
  const [pendingImageDeletes, setPendingImageDeletes] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function uploadFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (!selected.length) return;
    if (images.length + selected.length > maxProductImages) {
      onError(`A product can have up to ${maxProductImages} photos.`);
      return;
    }
    const invalid = selected.find((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024);
    if (invalid) {
      onError(`${invalid.name}: choose a JPG, PNG, or WebP image no larger than 2 MB.`);
      return;
    }
    setUploading(true);
    try {
      for (let offset = 0; offset < selected.length; offset += uploadBatchSize) {
        const body = new FormData();
        selected.slice(offset, offset + uploadBatchSize).forEach((file) => body.append("files", file));
        const result = await adminRequest<UploadedImages>("/api/admin/uploads", token, { method: "POST", body });
        setImages((current) => [...current, ...result.items.map((item) => item.url)]);
      }
      onError("");
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : "Could not upload product photos.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    const image = images[index];
    if (isStorageImage(image)) setPendingImageDeletes((current) => [...current, image]);
    setImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function moveImage(index: number, offset: number) {
    const destination = index + offset;
    if (destination < 0 || destination >= images.length) return;
    setImages((current) => {
      const ordered = [...current];
      [ordered[index], ordered[destination]] = [ordered[destination], ordered[index]];
      return ordered;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const priceValue = String(form.get("price") || "").trim();
    const originalPriceValue = String(form.get("original_price") || "").trim();
    const stockValue = String(form.get("stock") || "").trim();
    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      category_slug: categorySlug,
      price: priceValue ? Number(priceValue) : null,
      original_price: originalPriceValue ? Number(originalPriceValue) : null,
      stock: stockValue ? Number(stockValue) : null,
      description: String(form.get("description") || "").trim(),
      is_active: form.get("is_active") === "on",
      images,
    };
    try {
      await adminRequest(
        product ? `/api/admin/products/${encodeURIComponent(String(product.id))}` : "/api/admin/products",
        token,
        { method: product ? "PATCH" : "POST", body: JSON.stringify(payload) },
      );
      let cleanupFailed = false;
      for (const url of pendingImageDeletes) {
        try {
          await adminRequest("/api/admin/uploads", token, { method: "DELETE", body: JSON.stringify({ url }) });
        } catch {
          cleanupFailed = true;
        }
      }
      onError(cleanupFailed ? "Product saved, but one or more removed photos could not be deleted from storage." : "");
      await onSaved();
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
      <label className="text-xs font-semibold text-slate-600">Product name
        <input
          name="name"
          value={name}
          onChange={(event) => {
            const previousSlug = toSlug(name);
            const nextName = event.currentTarget.value;
            setName(nextName);
            if (!slug || slug === previousSlug) setSlug(toSlug(nextName));
          }}
          required
          maxLength={200}
          className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900"
        />
      </label>
      <label className="text-xs font-semibold text-slate-600">Slug
        <input name="slug" value={slug} onChange={(event) => setSlug(event.currentTarget.value)} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900" />
      </label>
      <label className="text-xs font-semibold text-slate-600">Category
        <select name="category_slug" value={categorySlug} onChange={(event) => setCategorySlug(event.currentTarget.value)} required className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900">
          {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold text-slate-600">Price (blank = quote)
        <input name="price" type="number" min="0" step="0.01" defaultValue={product?.price ?? ""} className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900" />
      </label>
      <label className="text-xs font-semibold text-slate-600">Original price
        <input name="original_price" type="number" min="0" step="0.01" defaultValue={product?.originalPrice ?? ""} className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900" />
      </label>
      <label className="text-xs font-semibold text-slate-600">Stock
        <input name="stock" type="number" min="0" step="1" defaultValue={product?.stock ?? ""} className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900" />
      </label>
      <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Description
        <textarea name="description" rows={3} maxLength={10000} defaultValue={product?.description ?? ""} className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900" />
      </label>

      <fieldset className="sm:col-span-2">
        <legend className="mb-2 text-xs font-semibold text-slate-600">Product photos (JPG, PNG, WebP; up to 2 MB each)</legend>
        <label className="inline-flex min-h-9 cursor-pointer items-center border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-cyan-800">
          {uploading ? "Uploading..." : "Choose photos"}
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading || images.length >= maxProductImages} onChange={uploadFiles} className="sr-only" />
        </label>
        <p className="mt-1 text-xs text-slate-500">{images.length}/{maxProductImages} photos. The first is the main storefront image. Use the arrows to reorder.</p>
        {images.length > 0 && <div className="mt-3 flex flex-wrap gap-3">
          {images.map((image, index) => <div key={`${image}-${index}`} className={`w-28 border bg-white p-2 ${index === 0 ? "border-cyan-800" : "border-slate-200"}`}>
            <ProductPhoto src={image} alt="" width={100} height={72} className="h-[72px] w-full object-contain" />
            <div className="mt-2 flex items-center justify-between gap-1">
              <span className="min-w-0 truncate text-[10px] font-semibold text-slate-600">{index === 0 ? "Main photo" : `Photo ${index + 1}`}</span>
              <div className="flex shrink-0">
                <button type="button" disabled={index === 0} onClick={() => moveImage(index, -1)} aria-label={`Move photo ${index + 1} earlier`} className="p-1 text-slate-600 disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
                <button type="button" disabled={index === images.length - 1} onClick={() => moveImage(index, 1)} aria-label={`Move photo ${index + 1} later`} className="p-1 text-slate-600 disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
                <button type="button" onClick={() => void removeImage(index)} aria-label={`Remove photo ${index + 1}`} className="p-1 text-red-600"><X className="h-3 w-3" /></button>
              </div>
            </div>
            {index > 0 && <button type="button" onClick={() => moveImage(index, -index)} className="mt-1 text-[10px] font-semibold text-cyan-900 hover:underline">Make main</button>}
          </div>)}
        </div>}
      </fieldset>

      <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
        <input name="is_active" type="checkbox" defaultChecked={product?.active !== false} className="h-4 w-4 accent-cyan-800" />
        Active on storefront
      </label>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button disabled={saving || uploading} className="inline-flex min-h-10 items-center justify-center gap-2 bg-cyan-800 px-4 text-sm font-semibold text-white hover:bg-cyan-900 disabled:opacity-60">
          <Save className="h-4 w-4" />{saving ? "Saving..." : product ? "Save changes" : "Create product"}
        </button>
        {onCancel && <button type="button" onClick={onCancel} className="min-h-10 border border-slate-300 px-4 text-sm font-semibold text-slate-700">Cancel</button>}
      </div>
    </form>
  );
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

  async function deleteProduct(product: Product) {
    if (!token || !window.confirm(`Permanently delete ${product.name}? Existing order history will be preserved.`)) return;
    try {
      await adminRequest(`/api/admin/products/${encodeURIComponent(String(product.id))}`, token, { method: "DELETE" });
      setError("");
      await reload(token);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not delete product.");
    }
  }

  return (
    <section className="border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">{live ? "Product catalog" : "Catalog preview"}</h2>
          <p className="mt-1 text-sm text-slate-500">{live ? `${items.length} products from the connected database.` : "Preview only until admin sign-in and Supabase are configured."}</p>
        </div>
        {token && <button type="button" onClick={() => setShowCreate((current) => !current)} className="inline-flex min-h-10 items-center gap-2 bg-[#102b43] px-4 text-sm font-semibold text-white hover:bg-cyan-900">
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{showCreate ? "Close" : "Add product"}
        </button>}
      </div>

      {error && <p role="alert" className="mb-5 border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
      {showCreate && token && <div className="mb-6">
        <ProductEditorForm token={token} onSaved={async () => { setShowCreate(false); await reload(token); }} onCancel={() => setShowCreate(false)} onError={setError} />
      </div>}

      {!items.length ? <p className="border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">No products in the catalog.</p> : <div className="divide-y divide-slate-200">
        {items.map((product) => <div key={product.id} className="py-4">
          {token ? <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <ProductPhoto src={product.images?.[0] || product.image} alt="" width={56} height={56} className="h-14 w-14 shrink-0 bg-slate-100 object-contain p-1" />
                <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
              </div>
              <button type="button" onClick={() => void deleteProduct(product)} aria-label={`Permanently delete ${product.name}`} className="inline-flex h-9 items-center gap-1 border border-red-200 px-2 text-xs font-semibold text-red-700 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" />Delete
              </button>
            </div>
            <ProductEditorForm key={product.id} token={token} product={product} onSaved={() => reload(token)} onError={setError} />
          </div> : <div className="flex items-center gap-3">
            <ProductPhoto src={product.image} alt="" width={56} height={56} className="h-14 w-14 shrink-0 bg-slate-100 object-contain p-1" />
            <div><p className="text-sm font-semibold text-slate-900">{product.name}</p><p className="text-xs text-slate-500">{product.category} · {product.active === false ? "Inactive" : "Active"}</p></div>
          </div>}
        </div>)}
      </div>}
    </section>
  );
}
