import Link from "next/link";

import { ContactMap } from "@/components/contact-map";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-800">LOG Industries</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Contact Us</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
        Need product information or help with an order? Contact LOG Industries and include the product name or order number so we can assist.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-bold text-slate-900">Get in touch</h2>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
              <li>Email: <a href="mailto:industrieslog@gmail.com" className="font-semibold text-cyan-900 hover:underline">industrieslog@gmail.com</a></li>
              <li>Phone: <a href="tel:+919910252540" className="font-semibold text-cyan-900 hover:underline">+91 99102 52540</a></li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">Product enquiries</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Browse the <Link href="/products" className="font-semibold text-cyan-900 hover:underline">product catalogue</Link> and contact us for current availability, delivery details, and product support.
            </p>
          </section>
        </div>
        <ContactMap />
      </div>
    </main>
  );
}
