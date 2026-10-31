import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { categories } from "@/lib/mock-data";
import { getCatalogProducts } from "@/lib/store-api";

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
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Catalog</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">{selectedCategory?.name ?? "All products"}</h1>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          <span className="font-medium">Filter:</span>
          <span>All categories</span>
        </div>
      </div>

      <nav aria-label="Product categories" className="mb-10 flex gap-2 overflow-x-auto pb-2">
        <Link
          href="/products"
          aria-current={!selectedCategory ? "page" : undefined}
          className={`shrink-0 border px-4 py-3 text-sm font-semibold transition ${!selectedCategory ? "border-[#102b43] bg-[#102b43] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}
        >
          All products
        </Link>
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/products?category=${category.slug}`}
            aria-current={selectedCategory?.slug === category.slug ? "page" : undefined}
            className={`shrink-0 border px-4 py-3 text-sm font-semibold transition ${selectedCategory?.slug === category.slug ? "border-[#102b43] bg-[#102b43] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}
          >
            {category.name}
          </Link>
        ))}
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">Showing {result.items.length} of {result.count} products</p>
        <Link href="/" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
          Back to home
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {result.items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {pageCount > 1 && <nav aria-label="Catalog pages" className="mt-10 flex flex-wrap justify-center gap-2">
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
          <Link
            key={pageNumber}
            href={`/products?${categoryQuery}page=${pageNumber}`}
            aria-current={pageNumber === page ? "page" : undefined}
            className={`grid h-10 min-w-10 place-items-center border px-3 text-sm font-semibold ${pageNumber === page ? "border-[#102b43] bg-[#102b43] text-white" : "border-slate-300 text-slate-700 hover:border-[#102b43]"}`}
          >
            {pageNumber}
          </Link>
        ))}
      </nav>}
    </main>
  );
}
