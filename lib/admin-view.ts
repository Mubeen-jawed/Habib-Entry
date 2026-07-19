import { cookies } from "next/headers";
import { auth } from "@/auth";

export const ADMIN_VIEW_COOKIE = "hb_admin_view";
export type AdminViewMode = "admin" | "user";

/**
 * Reads the admin's current preview mode from the cookie. Defaults to "admin"
 * for anyone who hasn't toggled it yet.
 */
export async function getAdminViewMode(): Promise<AdminViewMode> {
  const store = await cookies();
  const value = store.get(ADMIN_VIEW_COOKIE)?.value;
  return value === "user" ? "user" : "admin";
}

/**
 * Returns whether the current viewer should be treated as an admin for UI
 * gating. Real admins can flip themselves into "user" view to preview the app
 * as a regular user; non-admins are always non-admin. Route-level protection
 * (middleware) still uses the real role.
 */
export async function isEffectiveAdmin(): Promise<boolean> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return false;
  const mode = await getAdminViewMode();
  return mode === "admin";
}
