import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Signature monogram, the imtehan logo tile plus wordmark. The slight tilt on
// hover is the creative flourish.
export function BrandMark({
  size = "md",
  href = "/",
  className,
  linked = true,
}: {
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  linked?: boolean;
}) {
  const dims = {
    sm: { chip: "w-24 h-24 md:w-28 md:h-28", px: 112, sizes: "(max-width: 768px) 64px, 112px" },
    md: { chip: "w-24 h-24 md:w-40 md:h-40", px: 160, sizes: "(max-width: 768px) 96px, 160px" },
    lg: { chip: "w-32 h-32 md:w-56 md:h-56", px: 224, sizes: "(max-width: 768px) 128px, 224px" },
  }[size];

  const content = (
    <span className={cn("inline-flex items-center", className)}>
      <span
        aria-hidden
        className={cn("relative inline-flex items-center justify-center", dims.chip)}
      >
        <Image
          src="/logo-imtehan.png"
          alt=""
          width={dims.px}
          height={dims.px}
          sizes={dims.sizes}
          priority
          className="w-full h-full object-contain"
        />
      </span>
    </span>
  );

  if (!linked) return content;
  return (
    <Link href={href} aria-label="Imtehan, home">
      {content}
    </Link>
  );
}
