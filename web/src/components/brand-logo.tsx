"use client";

import Image from "next/image";
import { useState } from "react";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className={`brand-logo ${compact ? "compact" : ""}`}>
      {imageFailed ? (
        <span className="text-lg font-bold text-[#102b43]">LOG Industries</span>
      ) : (
        <Image
          src="/logindustries.png"
          alt="LOG Industries"
          width={600}
          height={226}
          onError={() => setImageFailed(true)}
          className={compact ? "h-auto w-[150px] sm:w-[180px]" : "h-auto w-[220px] sm:w-[280px]"}
        />
      )}
    </div>
  );
}
