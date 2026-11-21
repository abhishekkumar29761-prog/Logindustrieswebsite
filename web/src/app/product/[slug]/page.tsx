import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, Truck } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { ProductDescription } from "@/components/product-description";
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
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <Link href={`/products?category=${categorySlug}`} className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-50">
        <ArrowLeft className="h-4 w-4" /> Back to collection
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <ProductGallery images={product.images?.length ? product.images : (product.image ? [product.image] : [])} name={product.name} />

        <div>
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-800">
            {product.category}
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-[#102b43] sm:text-4xl">{product.name}</h1>

          <div className="mt-6 flex items-end gap-3">
            {product.price != null ? (
              <>
                <span className="text-4xl font-black text-[#102b43]">₹{product.price.toLocaleString("en-IN")}</span>
                {product.originalPrice != null && (
                  <span className="text-lg text-slate-400 line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                )}
              </>
            ) : (
              <span className="text-2xl font-bold text-blue-900">Price on request</span>
            )}
          </div>

          {product.description?.trim() && <ProductDescription description={product.description} />}

          <div className="mt-8 max-w-sm rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <AddToCartButton product={product} />
            {product.price == null && <p className="mt-3 text-xs leading-5 text-slate-600">Add it to your cart to request the current price. Checkout is available once the price is confirmed.</p>}
          </div>

          <div className="mt-8 space-y-4 border-t border-blue-100 pt-6">
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <Truck className="h-4 w-4 text-blue-700" />
              Contact us for delivery details
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <ShieldCheck className="h-4 w-4 text-blue-700" />
              Contact LOG Industries for product support
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && <div className="mt-16 border-t border-blue-100 pt-12 sm:mt-20 sm:pt-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-800">You may also like</p><h2 className="mt-2 text-3xl font-black text-[#102b43]">Related products</h2></div>
          <Link href="/products" className="text-sm font-semibold text-blue-900 transition hover:text-blue-700">
            View catalog
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>}
    </main>
  );
}
