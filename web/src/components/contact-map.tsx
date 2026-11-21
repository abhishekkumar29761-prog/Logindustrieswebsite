"use client";

import { useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";

const address = "172 Chand Nagar, New Delhi 110018";
const mapSearch = encodeURIComponent(address);

export function ContactMap() {
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <section className="rounded-sm border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Our address</h2>
          <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-slate-600">
            <MapPin className="mt-1 h-4 w-4 shrink-0 text-cyan-800" />
            <span>{address}</span>
          </p>
        </div>
        <button
          type="button"
          aria-expanded={mapOpen}
          aria-controls="contact-location-map"
          onClick={() => setMapOpen((open) => !open)}
          className="inline-flex min-h-10 items-center justify-center rounded-sm bg-[#102b43] px-4 text-sm font-semibold text-white transition hover:bg-cyan-900"
        >
          {mapOpen ? "Hide map" : "View map"}
        </button>
      </div>

      {mapOpen && (
        <div id="contact-location-map" className="mt-5 overflow-hidden border border-slate-200">
          <iframe
            title={`Map showing ${address}`}
            src={`https://maps.google.com/maps?q=${mapSearch}&output=embed`}
            className="h-72 w-full sm:h-96"
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
      )}
    </section>
  );
}
