import { PrismaClient } from "@prisma/client";

async function main() {
  const emailArg = process.argv[2];
  const roleArg = (process.argv[3] ?? "ADMIN").toUpperCase();

  if (!emailArg) {
    console.error("Usage: pnpm admin:promote <email> [FREE|PAID|ADMIN]");
    process.exit(1);
  }
  if (!["FREE", "PAID", "ADMIN"].includes(roleArg)) {
    console.error(`Invalid role "${roleArg}". Must be FREE, PAID, or ADMIN.`);
    process.exit(1);
  }

  const db = new PrismaClient();
  const email = emailArg.toLowerCase().trim();

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found with email ${email}. Sign up first, then re-run.`);
    process.exit(1);
  }

  const updated = await db.user.update({
    where: { email },
    data: { role: roleArg },
    select: { email: true, role: true, name: true },
  });

  console.log(`✔ ${updated.email} is now ${updated.role}`);
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
