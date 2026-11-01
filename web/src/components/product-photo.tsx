"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type ProductPhotoProps = {
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

export function ProductPhoto({ src, alt, width, height, className = "" }: ProductPhotoProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) return <div aria-label={`${alt} image unavailable`} className={`bg-slate-200 ${className}`} role="img" />;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
