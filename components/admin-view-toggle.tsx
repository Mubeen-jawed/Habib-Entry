import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  ADMIN_VIEW_COOKIE,
  getAdminViewMode,
  type AdminViewMode,
} from "@/lib/admin-view";
import { AdminViewToggleButton } from "./admin-view-toggle-button";

export async function AdminViewToggle() {
  const session = await auth();
  // Only real admins ever see this control, regardless of the current view.
  if (session?.user?.role !== "ADMIN") return null;

  const mode = await getAdminViewMode();

  async function toggleAction() {
    "use server";
    const s = await auth();
    if (s?.user?.role !== "ADMIN") return;
    const store = await cookies();
    const current = (store.get(ADMIN_VIEW_COOKIE)?.value === "user"
      ? "user"
      : "admin") satisfies AdminViewMode;
    const next: AdminViewMode = current === "admin" ? "user" : "admin";
    store.set(ADMIN_VIEW_COOKIE, next, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    revalidatePath("/", "layout");
  }

  return <AdminViewToggleButton mode={mode} toggleAction={toggleAction} />;
}
