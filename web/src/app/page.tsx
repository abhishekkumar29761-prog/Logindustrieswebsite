import Link from "next/link";
import { ArrowRight, Boxes, Headphones, PackageSearch } from "lucide-react";

import { CategoryCarousel } from "@/components/category-carousel";
import { FeaturedProductCarousel } from "@/components/featured-product-carousel";
import { ProductCard } from "@/components/product-card";
import { categories } from "@/lib/mock-data";
import { getCatalogProducts } from "@/lib/store-api";
import { canonicalMetadata, publicRoutes } from "@/lib/seo";

export const metadata = canonicalMetadata(publicRoutes.home);

export default async function HomePage() {
  const { items: products } = await getCatalogProducts({ limit: 12 });
  const categoriesWithImages = categories.map((category) => ({
    ...category,
    image: products.find((product) => product.categorySlug === category.slug && product.image)?.image
      || products.find((product) => product.categorySlug === category.slug)?.images?.[0]
      || "",
  }));

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-blue-100 bg-gradient-to-br from-white via-blue-50 to-sky-100/70">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-14">
          <div className="order-1 lg:order-1">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-800 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" /> LOG Industries · Smart hardware
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.08] text-[#101c2c] sm:text-5xl">
              Practical products for <span className="text-blue-800">safer, smarter spaces.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Explore automatic water controllers, sanitizer dispensers, smart locks, and door closers from LOG Industries.
            </p>
            <Link
              href="/products"
              className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-lg bg-[#102b43] px-6 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(16,43,67,0.65)] transition duration-200 hover:-translate-y-0.5 hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Shop all products <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-xs font-medium text-slate-600">
              <span className="inline-flex items-center gap-2"><Boxes className="h-4 w-4 text-cyan-800" /> {categories.length} specialist collections</span>
              <span className="inline-flex items-center gap-2"><PackageSearch className="h-4 w-4 text-cyan-800" /> {products.length} products listed</span>
            </div>
          </div>

          <div className="order-2 lg:order-2">
            <FeaturedProductCarousel products={products} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
        <div className="relative mb-9 flex justify-center">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-800 sm:text-sm">Explore collections</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#101c2c] sm:text-4xl lg:text-5xl">Shop by category</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">Find the right solution for your home, business, and everyday needs.</p>
          </div>
          <Link href="/products" className="absolute right-0 top-1/2 hidden -translate-y-1/2 items-center gap-1 text-sm font-semibold text-blue-900 transition hover:text-blue-700 lg:inline-flex">
            All products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <CategoryCarousel categories={categoriesWithImages} />
      </section>

      <section className="border-y border-blue-100 bg-gradient-to-b from-blue-50/70 to-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-800">Shop the LOG Industries range</p>
              <h2 className="mt-2 text-2xl font-bold text-[#101c2c] sm:text-3xl">All products</h2>
            </div>
            <Link href="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-900 transition hover:text-blue-700">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {products.length === 0 ? (
            <p className="border border-dashed border-slate-300 px-4 py-12 text-center text-sm text-slate-500">No products yet.</p>
          ) : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-3 lg:py-16">
        <div className="flex gap-4 border-b border-slate-200 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6">
          <Boxes className="mt-0.5 h-5 w-5 shrink-0 text-blue-800" />
          <div><h3 className="text-sm font-bold">Four product categories</h3><p className="mt-1 text-sm leading-6 text-slate-600">Browse water controllers, sanitizer dispensers, smart locks, and door closers.</p></div>
        </div>
        <div className="flex gap-4 border-b border-slate-200 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6">
          <PackageSearch className="mt-0.5 h-5 w-5 shrink-0 text-blue-800" />
          <div><h3 className="text-sm font-bold">Product information</h3><p className="mt-1 text-sm leading-6 text-slate-600">See listed product images and prices before contacting the team.</p></div>
        </div>
        <div className="flex gap-4">
          <Headphones className="mt-0.5 h-5 w-5 shrink-0 text-blue-800" />
          <div><h3 className="text-sm font-bold">Contact LOG Industries</h3><p className="mt-1 text-sm leading-6 text-slate-600"><a className="hover:text-blue-900" href="mailto:industrieslog@gmail.com">Email the team</a> or call <a className="whitespace-nowrap hover:text-blue-900" href="tel:+919910252510">+91 99102 52510</a>.</p></div>
        </div>
      </section>
    </main>
  );
}