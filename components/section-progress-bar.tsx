"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { readSnapshot } from "@/lib/guest-storage";

// Dashboard progress row for a practice section. Signed-in users see the
// server-provided `serverDone` (count of distinct db.answer rows the user has
// for this section). Guests see the length of the localStorage-tracked
// `section-attempted` list — the same one the PracticeRunner writes to on
// each finished batch — so the bar reflects their real cross-batch progress.
export function SectionProgressBar({
  sectionKey,
  total,
  serverDone,
  isGuest,
}: {
  sectionKey: string;
  total: number;
  serverDone: number;
  isGuest: boolean;
}) {
  const [done, setDone] = useState(serverDone);

  useEffect(() => {
    if (!isGuest) return;
    const attempted = readSnapshot<string[]>("section-attempted", sectionKey);
    if (Array.isArray(attempted)) {
      setDone(attempted.length);
    }
  }, [isGuest, sectionKey]);

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
        <span>Progress</span>
        <span className="font-medium text-foreground">
          {done}/{total} · {pct}%
        </span>
      </div>
      <Progress value={pct} />
    </div>
  );
}
