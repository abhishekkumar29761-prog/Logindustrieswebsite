import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { quickLinks } from "@/lib/site-navigation";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#f7f8f7] text-slate-700">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <BrandLogo compact />
          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">
            LOG Industries brings together smart water controllers, sanitizer dispensers, smartphone security locks, and automatic door closers.
          </p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Quick links</h3>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-slate-600">
            {quickLinks.map((item) => (
              <li key={item.href}><Link href={item.href} className="hover:text-cyan-900">{item.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Contact us</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li><a className="hover:text-cyan-900" href="mailto:industrieslog@gmail.com">industrieslog@gmail.com</a></li>
            <li><a className="hover:text-cyan-900" href="tel:+919910252540">+91 99102 52540</a></li>
            <li>172 Chand Nagar, New Delhi – 110018</li>
            <li><Link href="/contact" className="font-semibold text-cyan-900 hover:underline">Get in touch</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} LOG Industries. All rights reserved.
      </div>
    </footer>
  );
}
