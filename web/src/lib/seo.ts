import type { Metadata } from "next";

export const BASE_URL = "https://www.logindustries.com";

export const publicRoutes = {
  home: "/",
  about: "/about",
  products: "/products",
  contact: "/contact",
  privacy: "/privacy-policy",
  terms: "/terms-and-conditions",
  refund: "/refund-policy",
} as const;

export const publicSitemapPages = [
  { path: publicRoutes.home, priority: 1.0 },
  { path: publicRoutes.products, priority: 0.9 },
  { path: publicRoutes.about, priority: 0.6 },
  { path: publicRoutes.contact, priority: 0.6 },
  { path: publicRoutes.privacy, priority: 0.4 },
  { path: publicRoutes.terms, priority: 0.4 },
  { path: publicRoutes.refund, priority: 0.4 },
] as const;

export function canonicalMetadata(path: string): Metadata {
  return { alternates: { canonical: path } };
}
