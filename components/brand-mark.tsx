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
    sm: { chip: "w-20 h-20", px: 80 },
    md: { chip: "w-28 h-28", px: 112 },
    lg: { chip: "w-40 h-40", px: 160 },
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
