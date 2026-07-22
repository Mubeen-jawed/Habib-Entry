"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteUser } from "./actions";

function SubmitDeleteButton({
  disabled,
  variant = "icon",
}: {
  disabled?: boolean;
  variant?: "icon" | "full";
}) {
  const { pending } = useFormStatus();
  if (variant === "full") {
    return (
      <Button
        type="submit"
        size="sm"
        variant="destructive"
        disabled={disabled || pending}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Deleting…
          </>
        ) : (
          <>
            <Trash2 className="h-4 w-4" />
            Delete account
          </>
        )}
      </Button>
    );
  }
  return (
    <Button
      type="submit"
      size="sm"
      variant="destructive"
      disabled={disabled || pending}
      title="Delete user"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

export function DeleteUserButton({
  userId,
  email,
  disabled,
  redirectTo,
  variant = "icon",
}: {
  userId: string;
  email: string | null;
  disabled?: boolean;
  redirectTo?: string;
  variant?: "icon" | "full";
}) {
  return (
    <form
      action={deleteUser}
      onSubmit={(e) => {
        const label = email ?? "this user";
        if (
          !window.confirm(
            `Delete ${label}?\n\nThis will permanently remove the account and all attempts, essays, and sessions. This cannot be undone.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}
      <SubmitDeleteButton disabled={disabled} variant={variant} />
    </form>
  );
}
