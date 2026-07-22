"use server";

import { revalidatePath } from "next/cache";
import { auth, unstable_update } from "@/auth";
import { db } from "@/lib/db";
import type { SchoolSlug } from "@/lib/schools";

export async function switchSchool(slug: SchoolSlug) {
  const s = await auth();
  if (!s?.user?.id) throw new Error("Unauthorized");
  if (slug !== "dsse" && slug !== "ahss") throw new Error("Invalid school");

  await db.user.update({
    where: { id: s.user.id },
    data: { schoolSlug: slug },
  });

  // Force the JWT to refresh so middleware/pages see the new schoolSlug
  // immediately — same pattern used by /select-school.
  await unstable_update({ user: { schoolSlug: slug } });

  revalidatePath("/dashboard");
}
