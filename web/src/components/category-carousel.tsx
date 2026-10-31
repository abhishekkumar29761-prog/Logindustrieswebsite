"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { categories } from "@/lib/mock-data";

export function CategoryCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      const end = track.scrollWidth - track.clientWidth;
      if (end < 1) return;
      if (track.scrollLeft >= end - 8) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: 180, behavior: "smooth" });
      }
    }, 3500);

    return () => window.clearInterval(timer);
  }, []);

  function move(direction: -1 | 1) {
    trackRef.current?.scrollBy({ left: direction * 220, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div className="category-carousel-track flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-4 sm:justify-center sm:gap-9">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/products?category=${category.slug}`}
            className="group flex w-[112px] shrink-0 snap-start flex-col items-center gap-3 text-center sm:w-[142px]"
          >
            <span className="relative aspect-square w-full overflow-hidden rounded-full border border-slate-200 bg-[#f3f6f7] p-1 transition duration-300 group-hover:-translate-y-1 group-hover:border-cyan-800 group-hover:shadow-[0_10px_25px_-12px_rgba(8,145,178,0.55)]">
              <Image
                src={category.image}
                alt=""
                width={300}
                height={300}
                unoptimized
                className="h-full w-full rounded-full object-cover"
                loading="lazy"
              />
            </span>
            <span className="min-h-10 text-sm font-semibold leading-5 text-slate-800 group-hover:text-cyan-900">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
      <div className="absolute -top-12 right-0 hidden gap-2 sm:flex">
        <button
          type="button"
          aria-label="Previous categories"
          onClick={() => move(-1)}
          className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:border-cyan-800 hover:text-cyan-900"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next categories"
          onClick={() => move(1)}
          className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:border-cyan-800 hover:text-cyan-900"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}