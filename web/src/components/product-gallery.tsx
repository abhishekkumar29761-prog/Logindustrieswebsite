"use client";

import { useState } from "react";
import { ProductPhoto } from "@/components/product-photo";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const gallery = images.length ? images : [""];
  const [selected, setSelected] = useState(0);

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/40 to-sky-100/60 shadow-sm">
        <ProductPhoto
          src={gallery[selected]}
          alt={name}
          width={800}
          height={800}
          className="h-[360px] w-full object-contain p-8 sm:h-[500px] sm:p-12"
        />
      </div>
      {images.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            aria-label={`Show product photo ${index + 1}`}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
            className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white ${selected === index ? "border-blue-700" : "border-blue-100"}`}
          >
            <ProductPhoto src={image} alt="" width={64} height={64} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>}
    </div>
  );
}
