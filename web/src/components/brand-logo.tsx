import Image from "next/image";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-logo ${compact ? "compact" : ""}`}>
      <Image
        src="https://logindustries.com/wp-content/uploads/2025/11/cropped-tejasveer-logo-final-01-01-scaled-3-600x226.png"
        alt="LOG Industries"
        width={600}
        height={226}
        unoptimized
        className={compact ? "h-auto w-[150px] sm:w-[180px]" : "h-auto w-[220px] sm:w-[280px]"}
      />
    </div>
  );
}
