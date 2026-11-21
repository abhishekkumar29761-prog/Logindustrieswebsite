"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProductPhoto } from "@/components/product-photo";
import type { Product } from "@/lib/mock-data";

export function FeaturedProductCarousel({ products }: { products: Product[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const featuredProducts = products.filter((product) => product.image || product.images?.length);
  const activeProduct = featuredProducts[activeIndex];

  useEffect(() => {
    if (paused || featuredProducts.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        const offset = 1 + Math.floor(Math.random() * (featuredProducts.length - 1));
        return (current + offset) % featuredProducts.length;
      });
    }, 5000);

    return () => window.clearInterval(timer);
  }, [featuredProducts.length, paused]);

  function move(direction: -1 | 1) {
    setActiveIndex((current) => (current + direction + featuredProducts.length) % featuredProducts.length);
  }

  if (!activeProduct) {
    return <div aria-label="Product image unavailable" role="img" className="min-h-[300px] rounded-2xl bg-blue-100 sm:min-h-[420px]" />;
  }

  const image = activeProduct.images?.[0] || activeProduct.image;

  return (
    <div
      className="group relative block min-h-[300px] overflow-hidden rounded-2xl border border-white bg-white shadow-[0_20px_60px_-32px_rgba(16,43,67,0.45)] sm:min-h-[420px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <Link href={`/product/${activeProduct.slug}`} aria-label={`View ${activeProduct.name}`} className="absolute inset-0">
        <div key={`background-${image}`} className="absolute inset-0 animate-[hero-image-in_700ms_ease-out]">
          <ProductPhoto
            src={image}
            alt=""
            width={1200}
            height={900}
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
          />
        </div>
        <div className="absolute inset-0 bg-slate-950/15" />
        <div key={`product-${image}`} className="absolute inset-0 animate-[hero-image-in_700ms_ease-out]">
          <ProductPhoto
            src={image}
            alt={activeProduct.name}
            width={1200}
            height={900}
            className="absolute inset-0 h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-[1.03] sm:p-8"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#102b43]/80 via-transparent via-40% to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-7 sm:left-7 sm:right-7">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100">{activeProduct.category}</p>
            <p className="mt-1 truncate text-base font-bold text-white sm:text-lg">{activeProduct.name}</p>
            <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/30 bg-[#102b43]/75 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition group-hover:bg-[#102b43] sm:text-sm">
              Explore product <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
      {featuredProducts.length > 1 && (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2 sm:right-5 sm:top-5">
          <button
            type="button"
            aria-label="Previous featured product"
            onClick={() => move(-1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/60 bg-white/90 text-[#102b43] shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next featured product"
            onClick={() => move(1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/60 bg-white/90 text-[#102b43] shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
