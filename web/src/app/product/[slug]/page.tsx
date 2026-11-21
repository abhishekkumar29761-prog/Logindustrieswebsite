import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, ShieldCheck, Truck } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { categories } from "@/lib/mock-data";
import { getCatalogProduct, getCatalogProducts } from "@/lib/store-api";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);

  if (!product) {
    notFound();
  }

  const categorySlug = categories.find((category) => category.name === product.category)?.slug ?? "";
  const { items: categoryProducts } = await getCatalogProducts({ category: categorySlug, limit: 12 });
  const relatedProducts = categoryProducts.filter((item) => item.id !== product.id).slice(0, 4);

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href={`/products?category=${categorySlug}`} className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to collection
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <ProductGallery images={product.images?.length ? product.images : (product.image ? [product.image] : [])} name={product.name} />

        <div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            {product.category}
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950">{product.name}</h1>

          <div className="mt-6 flex items-end gap-3">
            {product.price != null ? (
              <>
                <span className="text-4xl font-black text-slate-950">₹{product.price.toLocaleString("en-IN")}</span>
                {product.originalPrice != null && (
                  <span className="text-lg text-slate-400 line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                )}
              </>
            ) : (
              <span className="text-2xl font-bold text-slate-900">Price on request</span>
            )}
          </div>

          {product.description?.trim() && (
            <section className="mt-6 border-t border-slate-200 pt-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">Product description</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{product.description}</p>
            </section>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <AddToCartButton product={product} />
            <Link
              href={`mailto:industrieslog@gmail.com?subject=${encodeURIComponent(`Order enquiry: ${product.name}`)}`}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#102b43] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-cyan-900"
            >
              <Mail className="h-4 w-4" /> Enquire to purchase
            </Link>
          </div>

          <div className="mt-8 space-y-4 border-t border-slate-200 pt-6">
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <Truck className="h-4 w-4 text-emerald-600" />
              Contact us for delivery details
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              Contact LOG Industries for product support
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && <div className="mt-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-black text-slate-950">Related items</h2>
          <Link href="/products" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
            View catalog
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>}
    </main>
  );
}
