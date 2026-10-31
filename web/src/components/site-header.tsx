import Link from "next/link";
import { Search, ShoppingCart, UserRound } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { CartCount } from "@/components/cart-count";
import { navItems } from "@/lib/mock-data";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <BrandLogo compact />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-cyan-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button aria-label="Search products" className="hidden p-2 text-slate-700 transition hover:text-cyan-900 sm:inline-flex">
            <Search className="h-4 w-4" />
          </button>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 px-2 py-2 text-sm font-medium text-slate-700 transition hover:text-cyan-900"
          >
            <span className="relative"><ShoppingCart className="h-4 w-4" /><span className="absolute -right-3 -top-2"><CartCount /></span></span>
            Cart
          </Link>
          <Link
            href="/user"
            className="inline-flex items-center gap-2 border-l border-slate-200 py-2 pl-4 text-sm font-semibold text-slate-700 transition hover:text-cyan-900"
          >
            <UserRound className="h-4 w-4" />
            Profile
          </Link>
        </div>
      </div>
    </header>
  );
}
