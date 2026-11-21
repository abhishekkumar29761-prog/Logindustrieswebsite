import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { quickLinks } from "@/lib/site-navigation";

export function SiteFooter() {
  const exploreLinks = quickLinks.slice(0, 3);
  const informationLinks = quickLinks.slice(3);

  return (
    <footer className="border-t border-white/10 bg-[#090709] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-12 sm:px-6 md:grid-cols-2 md:gap-x-8 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-14">
        <div className="md:col-span-2 lg:col-span-4">
          <div className="inline-block brightness-0 invert">
            <BrandLogo compact />
          </div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/65">A unit of Raja Engineering Works</p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">
            LOG Industries brings together smart water controllers, sanitizer dispensers, smartphone security locks, and automatic door closers.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a href="https://www.instagram.com/industrieslog/" target="_blank" rel="noreferrer" aria-label="LOG Industries on Instagram" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white hover:text-black">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                <circle cx="18" cy="6" r="1" fill="currentColor" />
              </svg>
            </a>
            <a href="https://www.facebook.com/61578339340286/" target="_blank" rel="noreferrer" aria-label="LOG Industries on Facebook" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white hover:text-black">
              <span aria-hidden="true" className="text-lg font-bold leading-none">f</span>
            </a>
          </div>
        </div>
        <div className="lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-white">Explore</h3>
          <ul className="mt-5 space-y-3 text-sm text-white/75">
            {exploreLinks.map((item) => (
              <li key={item.href}><Link href={item.href} className="transition hover:text-white">{item.label}</Link></li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-white">Information</h3>
          <ul className="mt-5 space-y-3 text-sm text-white/75">
            {informationLinks.map((item) => (
              <li key={item.href}><Link href={item.href} className="transition hover:text-white">{item.label}</Link></li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-white">Get in touch</h3>
          <ul className="mt-5 space-y-4 text-sm text-white/75">
            <li><a className="transition hover:text-white" href="tel:+919910252510">+91 99102 52510</a></li>
            <li><a className="transition hover:text-white" href="mailto:industrieslog@gmail.com">industrieslog@gmail.com</a></li>
            <li><a className="transition hover:text-white" href="https://wa.me/919910252540" target="_blank" rel="noreferrer">WhatsApp +91 99102 52540</a></li>
            <li className="max-w-xs leading-6">172 Chand Nagar, New Delhi – 110018</li>
            <li><Link href="/contact" className="font-semibold text-white underline decoration-white/40 underline-offset-4 transition hover:decoration-white">Contact us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 text-xs text-white/60 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} LOG Industries. All rights reserved.</p>
          <nav aria-label="Legal links" className="flex flex-wrap gap-x-5 gap-y-2">
            {quickLinks.slice(3, 6).map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-white">{item.label}</Link>
            ))}
          </nav>
        </div>
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
