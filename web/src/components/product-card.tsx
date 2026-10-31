import Link from "next/link";
import Image from "next/image";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { Product } from "@/lib/mock-data";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group min-w-0">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={product.image}
          alt={product.name}
          width={640}
          height={480}
          unoptimized
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        {product.originalPrice != null && product.price != null && (
          <span className="absolute left-3 top-3 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-800">
            Offer
          </span>
        )}
      </Link>

      <div className="space-y-2.5 pt-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-900">
          {product.category}
        </span>

        <div>
          <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {product.price != null ? (
              <>
                <span className="text-base font-bold text-slate-950">₹{product.price.toLocaleString("en-IN")}</span>
                {product.originalPrice != null && (
                  <span className="ml-2 text-xs text-slate-400 line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                )}
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-700">Price on request</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/product/${product.slug}`}
            className="flex min-h-10 flex-1 items-center justify-center border border-slate-300 px-3 text-center text-xs font-semibold text-slate-900 transition hover:border-[#102b43] hover:bg-[#102b43] hover:text-white"
          >
            View product
          </Link>
          <AddToCartButton product={product} compact />
        </div>
      </div>
    </article>
  );
}
