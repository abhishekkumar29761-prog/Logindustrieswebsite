"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";

import { addCartItem } from "@/lib/cart-store";
import type { Product } from "@/lib/mock-data";

export function AddToCartButton({ product, compact = false }: { product: Product; compact?: boolean }) {
  const [added, setAdded] = useState(false);

  function add() {
    addCartItem(product.id);
    setAdded(true);
  }

  return (
    <button
      type="button"
      onClick={add}
      aria-label={`${added ? "Added" : "Add"} ${product.name} to cart`}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${compact ? "min-w-11 px-3" : "w-full"} ${added ? "border-emerald-700 bg-emerald-700 text-white" : "border-[#102b43] bg-[#102b43] text-white hover:border-blue-900 hover:bg-blue-900"}`}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      <span>{added ? "Added" : "Add to cart"}</span>
    </button>
  );
}