"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CategoryItem = { slug: string; name: string; image: string };

export function CategoryCarousel({ categories }: { categories: CategoryItem[] }) {
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
            className="group flex w-[132px] shrink-0 snap-start flex-col items-center gap-3 text-center sm:w-[164px]"
          >
            <span className="relative aspect-square w-full overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-2 shadow-[0_10px_25px_-20px_rgba(16,43,67,0.6)] transition duration-300 group-hover:-translate-y-1 group-hover:border-blue-300 group-hover:shadow-[0_18px_30px_-18px_rgba(16,43,67,0.35)] sm:rounded-3xl sm:p-3">
              {category.image ? (
                <Image
                  src={category.image}
                  alt=""
                  width={300}
                  height={300}
                  unoptimized
                  className="h-full w-full rounded-xl object-contain transition duration-500 group-hover:scale-105 sm:rounded-2xl"
                  loading="lazy"
                />
              ) : <span aria-label={`${category.name} image unavailable`} role="img" className="block h-full w-full rounded-full bg-slate-200" />}
            </span>
            <span className="min-h-10 text-sm font-semibold leading-5 text-slate-800 transition-colors group-hover:text-blue-900">
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
          className="grid h-10 w-10 place-items-center rounded-full border border-blue-100 bg-white text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next categories"
          onClick={() => move(1)}
          className="grid h-10 w-10 place-items-center rounded-full border border-blue-100 bg-white text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}