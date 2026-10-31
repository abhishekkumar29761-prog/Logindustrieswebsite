"use client";

import { useSyncExternalStore } from "react";

import { getCartSnapshot, getServerCartSnapshot, parseCart, subscribeToCart } from "@/lib/cart-store";

export function CartCount() {
  const cartValue = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerCartSnapshot);
  const count = parseCart(cartValue).reduce((total, line) => total + line.quantity, 0);

  if (count === 0) return null;
  return <span className="grid h-5 min-w-5 place-items-center rounded-full bg-cyan-800 px-1 text-[10px] font-bold leading-none text-white">{count}</span>;
}