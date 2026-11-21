import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { categories } from "@/lib/mock-data";
import { getCatalogProducts } from "@/lib/store-api";
import { canonicalMetadata, publicRoutes } from "@/lib/seo";

export const metadata = canonicalMetadata(publicRoutes.products);

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category: categorySlug, page: pageParam } = await searchParams;
  const selectedCategory = categories.find((category) => category.slug === categorySlug);

  if (categorySlug && !selectedCategory) notFound();

  const page = Math.max(1, Number.parseInt(pageParam || "1", 10) || 1);
  const result = await getCatalogProducts({ category: selectedCategory?.slug, page, limit: 12 });
  const pageCount = Math.ceil(result.count / result.limit);
  const categoryQuery = selectedCategory ? `category=${encodeURIComponent(selectedCategory.slug)}&` : "";

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-800">LOG Industries · Catalog</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-[#102b43]">{selectedCategory?.name ?? "All products"}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Explore dependable products designed to make everyday spaces safer and smarter.</p>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-blue-100 bg-blue-50/70 px-4 py-2 text-sm text-blue-900">
          <span className="h-2 w-2 rounded-full bg-cyan-500" />
          <span className="font-semibold">{result.count} products available</span>
        </div>
      </div>

      <nav aria-label="Product categories" className="mb-8 flex gap-2 overflow-x-auto pb-3">
        <Link
          href="/products"
          aria-current={!selectedCategory ? "page" : undefined}
          className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${!selectedCategory ? "border-[#102b43] bg-[#102b43] text-white shadow-sm" : "border-blue-100 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"}`}
        >
          All products
        </Link>
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/products?category=${category.slug}`}
            aria-current={selectedCategory?.slug === category.slug ? "page" : undefined}
            className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${selectedCategory?.slug === category.slug ? "border-[#102b43] bg-[#102b43] text-white shadow-sm" : "border-blue-100 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"}`}
          >
            {category.name}
          </Link>
        ))}
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">Showing {result.items.length} of {result.count} products</p>
        <Link href="/" className="text-sm font-semibold text-blue-900 transition hover:text-blue-700">
          Back to home
        </Link>
      </div>

      {result.items.length === 0 ? (
        <p className="border border-dashed border-slate-300 px-4 py-12 text-center text-sm text-slate-500">No products yet.</p>
      ) : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>}
      {pageCount > 1 && <nav aria-label="Catalog pages" className="mt-10 flex flex-wrap justify-center gap-2">
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
          <Link
            key={pageNumber}
            href={`/products?${categoryQuery}page=${pageNumber}`}
            aria-current={pageNumber === page ? "page" : undefined}
            className={`grid h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm font-semibold ${pageNumber === page ? "border-[#102b43] bg-[#102b43] text-white" : "border-blue-100 text-slate-700 hover:border-blue-400 hover:bg-blue-50"}`}
          >
            {pageNumber}
          </Link>
        ))}
      </nav>}
    </main>
  );
}
