import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

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
            <li>WhatsApp: <a className="hover:text-cyan-900" href="https://wa.me/919910252540" target="_blank" rel="noreferrer">+91 99102 52540</a></li>
            <li>Call: <a className="hover:text-cyan-900" href="tel:+919910252510">+91 99102 52510</a></li>
            <li>172 Chand Nagar, New Delhi – 110018</li>
            <li><Link href="/contact" className="font-semibold text-cyan-900 hover:underline">Get in touch</Link></li>
          </ul>
          <div className="mt-5 flex items-center gap-3">
            <a href="https://www.facebook.com/61578339340286/" target="_blank" rel="noreferrer" aria-label="LOG Industries on Facebook" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:border-blue-700 hover:bg-blue-700 hover:text-white">
              <span aria-hidden="true" className="text-xl font-bold leading-none">f</span>
            </a>
            <a href="https://www.instagram.com/industrieslog/" target="_blank" rel="noreferrer" aria-label="LOG Industries on Instagram" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:border-pink-600 hover:bg-pink-600 hover:text-white">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                <circle cx="18" cy="6" r="1" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} LOG Industries. All rights reserved.
      </div>
    </footer>
  );
}

export function FloatingContactActions() {
  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col gap-3 sm:bottom-8 sm:right-8">
      <a
        href="tel:+919910252510"
        aria-label="Call LOG Industries at +91 99102 52510"
        title="Call us"
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan-700 text-white shadow-lg transition hover:scale-105 hover:bg-cyan-800"
      >
        <Phone className="h-5 w-5" />
      </a>
      <a
        href="https://wa.me/919910252540"
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp LOG Industries at +91 99102 52540"
        title="WhatsApp us"
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#1fb958]"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
    </div>
  );
}
