"use client";

import { useState } from "react";
import { ProductPhoto } from "@/components/product-photo";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const gallery = images.length ? images : [""];
  const [selected, setSelected] = useState(0);

  return (
    <div>
      <div className="overflow-hidden bg-slate-200">
        <ProductPhoto
          src={gallery[selected]}
          alt={name}
          width={800}
          height={800}
          className="h-[360px] w-full object-contain p-8 sm:h-[500px]"
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
            className={`h-16 w-16 shrink-0 overflow-hidden border-2 ${selected === index ? "border-cyan-800" : "border-transparent"}`}
          >
            <ProductPhoto src={image} alt="" width={64} height={64} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>}
    </div>
  );
}
