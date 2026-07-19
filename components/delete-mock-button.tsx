"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteMockButton({
  action,
  title,
}: {
  action: () => Promise<void>;
  title: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `Delete mock test "${title}"? This will remove the mock and its questions. Existing user attempts will be kept but unlinked.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <Button
        type="submit"
        size="sm"
        variant="outline"
        aria-label={`Delete ${title}`}
        title="Delete mock"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </form>
  );
}
