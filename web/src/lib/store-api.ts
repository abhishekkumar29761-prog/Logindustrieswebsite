import { categories, products, type Product } from "@/lib/mock-data";
import { getApiBaseUrl } from "@/lib/api-url";

export type ProductPage = { items: Product[]; count: number; page: number; limit: number };
type ProductResponse = { item: Product };
export type CatalogQuery = { category?: string; q?: string; page?: number; limit?: number };

function normalizeProduct(value: unknown): Product | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if ((typeof row.id !== "string" && typeof row.id !== "number") || typeof row.slug !== "string" || typeof row.name !== "string") return null;

  const categoryName = typeof row.category === "string"
    ? row.category
    : categories.find((item) => item.slug === row.category_slug)?.name;
  const categoryRecord = categories.find((item) => item.name === categoryName);
  if (!categoryName || !categoryRecord) return null;

  const price = row.price == null ? null : Number(row.price);
  const originalPrice = row.originalPrice == null ? null : Number(row.originalPrice);
  if ((price !== null && !Number.isFinite(price)) || (originalPrice !== null && !Number.isFinite(originalPrice))) return null;

  const isTankMateProCutout = row.slug === "tank-mate-pro-2"
    && typeof row.image === "string"
    && row.image.includes("/b7879529-9abc-46cb-968b-441f758d9687.png");
  const image = isTankMateProCutout ? "/product-images/tank-mate-pro-2.webp" : (typeof row.image === "string" ? row.image : "");
  const images = Array.isArray(row.images)
    ? row.images.filter((item): item is string => typeof item === "string")
    : (image ? [image] : []);
  const displayImages = isTankMateProCutout ? [image, ...images.slice(1)] : images;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: categoryName,
    categorySlug: typeof row.category_slug === "string" ? row.category_slug : categoryRecord.slug,
    price,
    originalPrice,
    image,
    images: displayImages,
    description: typeof row.description === "string" ? row.description : "",
    stock: typeof row.stock === "number" ? row.stock : null,
    active: typeof row.active === "boolean" ? row.active : true,
  };
}

export async function getCatalogProducts(query: CatalogQuery = {}): Promise<ProductPage> {
  const apiBaseUrl = getApiBaseUrl();
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 12));
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (query.category) params.set("category", query.category);
  if (query.q) params.set("q", query.q);
  const fallbackCategory = categories.find((item) => item.slug === query.category)?.name;
  const fallbackItems = products.filter((product) => !fallbackCategory || product.category === fallbackCategory)
    .filter((product) => !query.q || product.name.toLowerCase().includes(query.q.toLowerCase()));
  const fallbackStart = (page - 1) * limit;
  const fallback = { items: fallbackItems.slice(fallbackStart, fallbackStart + limit), count: fallbackItems.length, page, limit };

  try {
    const response = await fetch(`${apiBaseUrl}/api/products?${params}`, { next: { revalidate: 60 } });
    if (!response.ok) return process.env.NODE_ENV !== "production" ? fallback : { items: [], count: 0, page, limit };
    const result = (await response.json()) as Partial<ProductPage>;
    if (!Array.isArray(result.items)) return process.env.NODE_ENV !== "production" ? fallback : { items: [], count: 0, page, limit };
    const normalizedItems = result.items.map(normalizeProduct).filter((item): item is Product => item !== null);
    return {
      items: result.items.length > 0 && normalizedItems.length === 0 && process.env.NODE_ENV !== "production" ? fallback.items : normalizedItems,
      count: typeof result.count === "number" ? result.count : normalizedItems.length,
      page: typeof result.page === "number" ? result.page : page,
      limit: typeof result.limit === "number" ? result.limit : limit,
    };
  } catch {
    return process.env.NODE_ENV !== "production" ? fallback : { items: [], count: 0, page, limit };
  }
}

export async function getCatalogProduct(slug: string): Promise<Product | null> {
  const apiBaseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${apiBaseUrl}/api/products/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
    if (response.status === 404) return null;
    if (!response.ok) return process.env.NODE_ENV !== "production" ? products.find((product) => product.slug === slug) ?? null : null;
    const result = (await response.json()) as Partial<ProductResponse>;
    return normalizeProduct(result.item) ?? (process.env.NODE_ENV !== "production" ? products.find((product) => product.slug === slug) ?? null : null);
  } catch {
    return process.env.NODE_ENV !== "production" ? products.find((product) => product.slug === slug) ?? null : null;
  }
}