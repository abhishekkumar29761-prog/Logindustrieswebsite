"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";

import { addCartItem } from "@/lib/cart-store";
import type { Product } from "@/lib/mock-data";

export function AddToCartButton({ product, compact = false }: { product: Product; compact?: boolean }) {
  const [added, setAdded] = useState(false);
  const unavailable = product.price == null;

  function add() {
    if (unavailable) return;
    addCartItem(product.id);
    setAdded(true);
  }

  return (
    <button
      type="button"
      onClick={add}
      disabled={unavailable}
      aria-label={unavailable ? `${product.name} price on request` : `Add ${product.name} to cart`}
      className={`inline-flex min-h-10 items-center justify-center gap-2 border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 ${compact ? "min-w-11 px-3" : "w-full"} ${added ? "border-emerald-700 bg-emerald-700 text-white" : "border-[#102b43] bg-[#102b43] text-white hover:bg-cyan-900"}`}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      <span>{unavailable ? "Price on request" : added ? "Added" : "Add to cart"}</span>
    </button>
  );
}