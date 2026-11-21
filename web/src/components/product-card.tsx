import Link from "next/link";
import { ArrowUpRight, BadgePercent } from "lucide-react";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductPhoto } from "@/components/product-photo";
import type { Product } from "@/lib/mock-data";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_-20px_rgba(16,43,67,0.5)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_38px_-22px_rgba(16,43,67,0.4)]">
      <Link href={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-white via-blue-50/60 to-sky-100/70">
        <ProductPhoto
          src={product.images?.[0] || product.image}
          alt=""
          width={640}
          height={640}
          className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-[1.06] sm:p-7"
        />
        {product.originalPrice != null && product.price != null && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-blue-100 bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-blue-800 shadow-sm">
            <BadgePercent className="h-3.5 w-3.5" /> Special price
          </span>
        )}
        <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/80 bg-white/90 text-[#102b43] shadow-sm transition group-hover:bg-[#102b43] group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <span className="w-fit rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-800">
          {product.category}
        </span>
        <h3 className="mt-3 line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-900 transition-colors group-hover:text-blue-900">
          {product.name}
        </h3>

        <div className="mt-3 flex min-h-8 items-center gap-2">
          {product.price != null ? (
            <>
              <span className="text-lg font-extrabold tracking-tight text-[#102b43]">₹{product.price.toLocaleString("en-IN")}</span>
              {product.originalPrice != null && (
                <span className="text-xs text-slate-400 line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
              )}
            </>
          ) : (
            <span className="text-sm font-semibold text-blue-800">Price on request</span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
          <Link
            href={`/product/${product.slug}`}
            className="flex min-h-10 flex-1 items-center justify-center rounded-lg border border-blue-200 px-3 text-center text-xs font-semibold text-[#102b43] transition hover:border-[#102b43] hover:bg-[#102b43] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            View product
          </Link>
          <AddToCartButton product={product} compact />
        </div>
      </div>
    </article>
  );
}
