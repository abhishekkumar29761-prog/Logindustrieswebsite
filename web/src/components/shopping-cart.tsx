"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { getCustomerToken, getServerCustomerToken, subscribeToCustomerAuth } from "@/lib/auth-store";
import { getCartSnapshot, getServerCartSnapshot, parseCart, removeCartItem, setCartQuantity, clearCart, subscribeToCart } from "@/lib/cart-store";
import { products as previewProducts, type Product } from "@/lib/mock-data";
import { getCatalogProducts } from "@/lib/store-api";
import { getApiBaseUrl } from "@/lib/api-url";
import { ProductPhoto } from "@/components/product-photo";

export function ShoppingCartPage() {
  const cartSnapshot = useSyncExternalStore(getCartSubscription, getCartSnapshot, getServerCartSnapshot);
  const token = useSyncExternalStore(subscribeToCustomerAuth, getCustomerToken, getServerCustomerToken);
  const [catalog, setCatalog] = useState<Product[]>(previewProducts);
  const [address, setAddress] = useState({ street: "", city: "", postalCode: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    getCatalogProducts({ limit: 100 }).then(({ items }) => { if (active) setCatalog(items); });
    return () => { active = false; };
  }, []);

  const lines = parseCart(cartSnapshot);
  const cartProducts = lines.map((line) => ({
    line,
    product: catalog.find((item) => String(item.id) === line.productId),
  }));
  const totalCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cartProducts.reduce((sum, entry) => sum + (entry.product?.price ?? 0) * entry.line.quantity, 0);
  const quoteItems = cartProducts.filter(({ product }) => product?.price == null);
  const quoteEmail = `mailto:industrieslog@gmail.com?${new URLSearchParams({
    subject: "Product price request",
    body: `Please share the current price and availability for:\n${quoteItems.map(({ line, product }) => `- ${product?.name || "Product"} (quantity: ${line.quantity})`).join("\n")}`,
  })}`;

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!token) {
      setMessage("Sign in to place this order.");
      return;
    }
    if (!cartProducts.length || cartProducts.some(({ product }) => !product)) {
      setMessage("One or more cart items are unavailable. Remove them before checkout.");
      return;
    }
    if (quoteItems.length) {
      setMessage("Request a price for items marked “Price on request” before placing this order.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/account/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: cartProducts.map(({ line, product }) => ({ product_id: product!.id, quantity: line.quantity })),
          shipping_address: { address: address.street, city: address.city, postal_code: address.postalCode },
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create order.");
      clearCart();
      setMessage(`Order ${result.item.order_number} placed. Payment is still pending; our team will confirm shipping and payment separately.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to place order. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="mb-8 border-b border-slate-200 pb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-900">Your shopping cart</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Cart <span className="text-slate-400">({totalCount})</span></h1>
      </div>

      {!lines.length ? (
        <section className="border border-slate-200 bg-slate-50 px-6 py-14 text-center">
          <h2 className="text-lg font-semibold text-slate-900">Your cart is empty</h2>
          <p className="mt-2 text-sm text-slate-600">Add a product from the catalog to start an order.</p>
          <Link href="/products" className="mt-6 inline-flex min-h-11 items-center bg-[#102b43] px-5 text-sm font-semibold text-white hover:bg-cyan-900">Browse products</Link>
        </section>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <section aria-label="Cart items" className="divide-y divide-slate-200 border-y border-slate-200">
            {cartProducts.map(({ line, product }) => product ? (
              <article key={line.productId} className="flex gap-4 py-5 sm:gap-6">
                <Link href={`/product/${product.slug}`} className="h-24 w-24 shrink-0 bg-slate-100 sm:h-28 sm:w-28">
                  <ProductPhoto src={product.images?.[0] || product.image} alt={product.name} width={112} height={112} className="h-full w-full object-contain p-2" />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-900">{product.category}</p>
                  <Link href={`/product/${product.slug}`} className="mt-1 block font-semibold text-slate-950 hover:text-cyan-900">{product.name}</Link>
                  <p className="mt-2 text-sm font-bold text-slate-900">{product.price == null ? "Price on request" : `₹${product.price.toLocaleString("en-IN")}`}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button type="button" aria-label={`Decrease ${product.name} quantity`} onClick={() => setCartQuantity(line.productId, line.quantity - 1)} className="grid h-8 w-8 place-items-center border border-slate-300 text-slate-700 hover:bg-slate-100"><Minus className="h-3.5 w-3.5" /></button>
                    <span aria-label="Quantity" className="min-w-6 text-center text-sm font-semibold">{line.quantity}</span>
                    <button type="button" aria-label={`Increase ${product.name} quantity`} onClick={() => setCartQuantity(line.productId, line.quantity + 1)} className="grid h-8 w-8 place-items-center border border-slate-300 text-slate-700 hover:bg-slate-100"><Plus className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => removeCartItem(line.productId)} className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" />Remove</button>
                  </div>
                </div>
                <p className="hidden text-right text-sm font-bold text-slate-900 sm:block">{product.price == null ? "On request" : `₹${(product.price * line.quantity).toLocaleString("en-IN")}`}</p>
              </article>
            ) : (
              <article key={line.productId} className="flex items-center justify-between gap-4 py-5">
                <p className="text-sm text-slate-600">A product in this cart is no longer available.</p>
                <button type="button" onClick={() => removeCartItem(line.productId)} className="text-sm font-semibold text-red-700">Remove</button>
              </article>
            ))}
          </section>

          <aside className="border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">Order summary</h2>
            <div className="mt-5 flex justify-between border-b border-slate-200 pb-4 text-sm text-slate-600"><span>Items subtotal</span><span className="font-semibold text-slate-900">₹{subtotal.toLocaleString("en-IN")}</span></div>
            {quoteItems.length > 0 && (
              <div className="mt-4 rounded-sm border border-cyan-200 bg-cyan-50 p-3">
                <p className="text-xs leading-5 text-slate-700">Price is needed for {quoteItems.length} item{quoteItems.length === 1 ? "" : "s"} before checkout.</p>
                <a href={quoteEmail} className="mt-2 inline-flex text-sm font-semibold text-cyan-900 underline underline-offset-4 hover:text-cyan-700">
                  Request price by email
                </a>
              </div>
            )}
            <div className="mt-4 flex justify-between text-sm text-slate-600"><span>Shipping</span><span>To be confirmed</span></div>
            <p className="mt-2 text-xs leading-5 text-slate-500">Shipping and payment are confirmed by the LOG Industries team. No payment is collected online yet.</p>
            <div className="mt-5 border-t border-slate-200 pt-4 text-sm font-bold text-slate-950">Order value before shipping <span className="float-right">₹{subtotal.toLocaleString("en-IN")}</span></div>

            <form onSubmit={submitOrder} className="mt-6 space-y-4 border-t border-slate-200 pt-5">
              <h3 className="text-sm font-bold text-slate-900">Delivery address</h3>
              <label className="block text-xs font-medium text-slate-600">Street address<input required value={address.street} onChange={(event) => setAddress((current) => ({ ...current, street: event.target.value }))} autoComplete="street-address" className="mt-1.5 w-full border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-800" /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-medium text-slate-600">City<input required value={address.city} onChange={(event) => setAddress((current) => ({ ...current, city: event.target.value }))} autoComplete="address-level2" className="mt-1.5 w-full border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-800" /></label>
                <label className="block text-xs font-medium text-slate-600">PIN code<input required inputMode="numeric" value={address.postalCode} onChange={(event) => setAddress((current) => ({ ...current, postalCode: event.target.value }))} autoComplete="postal-code" className="mt-1.5 w-full border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-800" /></label>
              </div>
              {token ? (
                <button type="submit" disabled={submitting || !cartProducts.length || quoteItems.length > 0} className="min-h-11 w-full bg-[#102b43] px-5 text-sm font-semibold text-white hover:bg-cyan-900 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Submitting order..." : quoteItems.length ? "Price confirmation required" : "Place order · payment pending"}</button>
              ) : (
                <Link href="/user?next=/cart" className="flex min-h-11 items-center justify-center bg-[#102b43] px-5 text-sm font-semibold text-white hover:bg-cyan-900">Sign in to place order</Link>
              )}
              {message && <p role="status" className="border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-900">{message}</p>}
            </form>
          </aside>
        </div>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/products" className="text-sm font-semibold text-slate-700 underline underline-offset-4 hover:text-cyan-900">Continue shopping</Link>
        {lines.length > 0 && <button type="button" onClick={clearCart} className="text-sm text-slate-500 underline underline-offset-4 hover:text-red-700">Clear cart</button>}
      </div>
    </main>
  );
}

function getCartSubscription(onChange: () => void) {
  return subscribeToCart(onChange);
}