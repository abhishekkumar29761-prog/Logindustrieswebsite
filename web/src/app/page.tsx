import Link from "next/link";
import { ArrowRight, Boxes, ChevronRight, Headphones, PackageSearch } from "lucide-react";

import { CategoryCarousel } from "@/components/category-carousel";
import { ProductCard } from "@/components/product-card";
import { categories } from "@/lib/mock-data";
import { getCatalogProducts } from "@/lib/store-api";

export default async function HomePage() {
  const { items: products } = await getCatalogProducts({ limit: 12 });
  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-[#f3f6f7]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-14">
          <div className="order-1 lg:order-1">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-800">LOG Industries · Smart hardware</p>
            <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.08] text-[#101c2c] sm:text-5xl">
              Practical products for safer, smarter spaces.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Explore automatic water controllers, sanitizer dispensers, smart locks, and door closers from LOG Industries.
            </p>
            <Link
              href="/products"
              className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-sm bg-[#102b43] px-6 text-sm font-semibold text-white transition hover:bg-cyan-900"
            >
              Shop all products <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-xs font-medium text-slate-600">
              <span className="inline-flex items-center gap-2"><Boxes className="h-4 w-4 text-cyan-800" /> {categories.length} specialist collections</span>
              <span className="inline-flex items-center gap-2"><PackageSearch className="h-4 w-4 text-cyan-800" /> {products.length} products listed</span>
            </div>
          </div>

          <Link href="/products" className="group relative order-2 block min-h-[300px] overflow-hidden bg-white sm:min-h-[420px] lg:order-2">
            <div aria-label="Product image unavailable" role="img" className="absolute inset-0 h-full w-full bg-slate-200" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 flex items-center gap-2 text-sm font-semibold text-white sm:bottom-7 sm:left-7">
              Explore LOG products <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-800">Explore collections</p>
            <h2 className="mt-2 text-2xl font-bold text-[#101c2c] sm:text-3xl">Shop by category</h2>
          </div>
          <Link href="/products" className="hidden items-center gap-1 text-sm font-semibold text-slate-700 hover:text-cyan-900 sm:inline-flex">
            All products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <CategoryCarousel />
      </section>

      <section className="bg-[#f7f8f7] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-800">Shop the LOG Industries range</p>
              <h2 className="mt-2 text-2xl font-bold text-[#101c2c] sm:text-3xl">All products</h2>
            </div>
            <Link href="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-cyan-900">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {products.length === 0 ? (
            <p className="border border-dashed border-slate-300 px-4 py-12 text-center text-sm text-slate-500">No products yet.</p>
          ) : <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-3 lg:py-16">
        <div className="flex gap-4 border-b border-slate-200 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6">
          <Boxes className="mt-0.5 h-5 w-5 shrink-0 text-cyan-800" />
          <div><h3 className="text-sm font-bold">Four product categories</h3><p className="mt-1 text-sm leading-6 text-slate-600">Browse water controllers, sanitizer dispensers, smart locks, and door closers.</p></div>
        </div>
        <div className="flex gap-4 border-b border-slate-200 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6">
          <PackageSearch className="mt-0.5 h-5 w-5 shrink-0 text-cyan-800" />
          <div><h3 className="text-sm font-bold">Product information</h3><p className="mt-1 text-sm leading-6 text-slate-600">See listed product images and prices before contacting the team.</p></div>
        </div>
        <div className="flex gap-4">
          <Headphones className="mt-0.5 h-5 w-5 shrink-0 text-cyan-800" />
          <div><h3 className="text-sm font-bold">Contact LOG Industries</h3><p className="mt-1 text-sm leading-6 text-slate-600"><a className="hover:text-cyan-900" href="mailto:industrieslog@gmail.com">Email the team</a> or call <a className="whitespace-nowrap hover:text-cyan-900" href="tel:+919910252540">+91 99102 52540</a>.</p></div>
        </div>
      </section>
    </main>
  );
}