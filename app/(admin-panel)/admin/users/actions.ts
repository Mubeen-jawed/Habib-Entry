"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const ROLES = new Set(["FREE", "PAID", "ADMIN"]);

export async function updateUserRole(formData: FormData) {
  const session = await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!userId || !ROLES.has(role)) return;

  // Don't let an admin demote themselves, avoids locking yourself out.
  if (userId === session.user.id && role !== "ADMIN") return;

  await db.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}
