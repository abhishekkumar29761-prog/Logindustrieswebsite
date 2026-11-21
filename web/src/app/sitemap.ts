import type { MetadataRoute } from "next";

import { getCatalogProducts } from "@/lib/store-api";
import { BASE_URL, publicSitemapPages } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = publicSitemapPages.map(({ path, priority }) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority,
  }));

  try {
    const firstPage = await getCatalogProducts({ page: 1, limit: 100 });
    const pageCount = Math.ceil(firstPage.count / firstPage.limit);
    const additionalPages = await Promise.all(
      Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
        getCatalogProducts({ page: index + 2, limit: 100 }),
      ),
    );
    const products = [firstPage, ...additionalPages].flatMap((page) => page.items);

    return [
      ...staticEntries,
      ...products.map((product) => ({
        url: `${BASE_URL}/product/${encodeURIComponent(product.slug)}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticEntries;
  }
}
