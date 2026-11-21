"use client";

import { ExternalLink, MapPin } from "lucide-react";

const address = "172 Chand Nagar, New Delhi 110018";
const mapSearch = encodeURIComponent(address);

export function ContactMap() {
  return (
    <section className="rounded-sm border border-slate-200 bg-white p-5 sm:p-6">
      <div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Our address</h2>
          <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-slate-600">
            <MapPin className="mt-1 h-4 w-4 shrink-0 text-cyan-800" />
            <span>{address}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden border border-slate-200">
        <iframe
          title={`Map showing ${address}`}
          src={`https://maps.google.com/maps?q=${mapSearch}&output=embed`}
          className="h-48 w-full sm:h-56"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="flex justify-end border-t border-slate-200 p-3">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapSearch}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-900 hover:underline"
          >
            Open in Google Maps <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
