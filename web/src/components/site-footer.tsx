import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { categories } from "@/lib/mock-data";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#f7f8f7] text-slate-700">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <BrandLogo compact />
          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">
            Water controllers, sanitizer dispensers, smartphone security locks, and automatic door closers.
          </p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Collections</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {categories.map((category) => (
              <li key={category.slug}><Link href={`/products?category=${category.slug}`} className="hover:text-cyan-900">{category.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li><a className="hover:text-cyan-900" href="mailto:industrieslog@gmail.com">industrieslog@gmail.com</a></li>
            <li><a className="hover:text-cyan-900" href="tel:+919910252540">+91 99102 52540</a></li>
            <li>172 Chand Nagar, New Delhi – 110018</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        © 2026 LogIndustries. All rights reserved.
      </div>
    </footer>
  );
}
