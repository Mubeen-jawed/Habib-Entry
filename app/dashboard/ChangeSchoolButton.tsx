"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { switchSchool } from "./actions";
import type { SchoolSlug } from "@/lib/schools";

type SchoolInfo = {
  slug: SchoolSlug;
  code: string;
  name: string;
};

export function ChangeSchoolButton({
  current,
  target,
}: {
  current: SchoolInfo;
  target: SchoolInfo;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !isPending) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isPending]);

  function confirm() {
    startTransition(async () => {
      await switchSchool(target.slug);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-brand-strong hover:underline"
      >
        Change
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-school-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => {
              if (!isPending) setOpen(false);
            }}
            aria-hidden
          />
          <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-pop">
            <h2
              id="change-school-title"
              className="text-lg font-semibold tracking-tight"
            >
              Switch to {target.code}?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              You&apos;re currently applying to{" "}
              <span className="font-medium text-foreground">
                {current.name}
              </span>
              . This will change your school to{" "}
              <span className="font-medium text-foreground">{target.name}</span>
              . Your practice and mocks will be tailored to {target.code} from
              now on.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={confirm}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Switching…
                  </>
                ) : (
                  <>Switch to {target.code}</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
