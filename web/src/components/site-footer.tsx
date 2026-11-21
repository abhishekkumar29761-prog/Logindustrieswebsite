import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { quickLinks } from "@/lib/site-navigation";

export function SiteFooter() {
  const exploreLinks = quickLinks.slice(0, 3);
  const informationLinks = quickLinks.slice(3);

  return (
    <footer className="relative overflow-hidden border-t border-cyan-300/20 bg-gradient-to-br from-[#0a1d30] via-[#102b43] to-[#164767] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-12 sm:px-6 md:grid-cols-2 md:gap-x-8 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-14">
        <div className="md:col-span-2 lg:col-span-4">
          <div className="inline-block brightness-0 invert">
            <BrandLogo compact />
          </div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/80">A unit of Raja Engineering Works</p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-200/80">
            LOG Industries brings together smart water controllers, sanitizer dispensers, smartphone security locks, and automatic door closers.
          </p>
          <div className="mt-6 flex items-center gap-3" aria-label="Social media">
            <a href="https://www.instagram.com/industrieslog/" target="_blank" rel="noreferrer" aria-label="LOG Industries on Instagram" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-300 hover:text-[#102b43] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                <circle cx="18" cy="6" r="1" fill="currentColor" />
              </svg>
            </a>
            <a href="https://www.facebook.com/61578339340286/" target="_blank" rel="noreferrer" aria-label="LOG Industries on Facebook" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-300 hover:text-[#102b43] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">
              <span aria-hidden="true" className="text-lg font-bold leading-none">f</span>
            </a>
          </div>
        </div>
        <div className="lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">Explore</h3>
          <div className="mt-3 h-0.5 w-8 rounded-full bg-cyan-300/80" />
          <ul className="mt-5 space-y-3.5 text-sm text-slate-200/80">
            {exploreLinks.map((item) => (
              <li key={item.href}><Link href={item.href} className="transition-colors hover:text-cyan-200 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">{item.label}</Link></li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">Information</h3>
          <div className="mt-3 h-0.5 w-8 rounded-full bg-cyan-300/80" />
          <ul className="mt-5 space-y-3.5 text-sm text-slate-200/80">
            {informationLinks.map((item) => (
              <li key={item.href}><Link href={item.href} className="transition-colors hover:text-cyan-200 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">{item.label}</Link></li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">Get in touch</h3>
          <div className="mt-3 h-0.5 w-8 rounded-full bg-cyan-300/80" />
          <ul className="mt-5 space-y-4 text-sm text-slate-200/80">
            <li className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" /><a className="transition-colors hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200" href="tel:+919910252510">+91 99102 52510</a></li>
            <li className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" /><a className="break-all transition-colors hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200" href="mailto:industrieslog@gmail.com">industrieslog@gmail.com</a></li>
            <li className="flex items-start gap-3"><MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" /><a className="transition-colors hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200" href="https://wa.me/919910252540" target="_blank" rel="noreferrer">WhatsApp +91 99102 52540</a></li>
            <li className="flex items-start gap-3 leading-6"><MapPin className="mt-1 h-4 w-4 shrink-0 text-cyan-200" /><span>172 Chand Nagar, New Delhi – 110018</span></li>
            <li className="pt-1"><Link href="/contact" className="inline-flex min-h-10 items-center rounded-full border border-cyan-200/40 px-4 font-semibold text-cyan-100 transition duration-200 hover:border-cyan-200 hover:bg-cyan-200 hover:text-[#102b43] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">Contact us <span aria-hidden="true" className="ml-2">→</span></Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 bg-[#071827]/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 text-xs text-slate-300/70 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} LOG Industries. All rights reserved.</p>
          <nav aria-label="Legal links" className="flex flex-wrap gap-x-5 gap-y-2">
            {quickLinks.slice(3, 6).map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-cyan-200 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">{item.label}</Link>
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
