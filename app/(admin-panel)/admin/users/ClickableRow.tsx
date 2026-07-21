"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function ClickableRow({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <tr
      className="border-t hover:bg-muted/40 cursor-pointer"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        // Don't navigate when interacting with the role-change form.
        if (target.closest("form,button,select,input,a")) return;
        router.push(href);
      }}
    >
      {children}
    </tr>
  );
}
