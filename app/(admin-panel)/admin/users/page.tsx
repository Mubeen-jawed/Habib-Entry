import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin";
import { updateUserRole } from "./actions";
import { ClickableRow } from "./ClickableRow";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type Search = { q?: string; role?: string; page?: string };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const session = await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const roleFilter = sp.role && ["FREE", "PAID", "ADMIN"].includes(sp.role) ? sp.role : "";
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const where: Prisma.UserWhereInput = {};
  if (q) {
    where.OR = [
      { email: { contains: q } },
      { name: { contains: q } },
    ];
  }
  if (roleFilter) where.role = roleFilter;

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: {
        _count: { select: { attempts: true, essays: true, sessions: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm">
            {total} total · showing page {page} of {totalPages}
          </p>
        </div>

        <form className="flex gap-2 items-center" action="/admin/users">
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search email or name…"
            className="w-64"
          />
          <select
            name="role"
            defaultValue={roleFilter}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All roles</option>
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
            <option value="ADMIN">Admin</option>
          </select>
          <Button type="submit" variant="outline" size="sm">
            Filter
          </Button>
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Major</th>
                  <th className="px-4 py-3 font-medium text-right">Attempts</th>
                  <th className="px-4 py-3 font-medium text-right">Essays</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Last sign-in</th>
                  <th className="px-4 py-3 font-medium text-right">Change role</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      No users match those filters.
                    </td>
                  </tr>
                )}
                {users.map((u) => {
                  const isSelf = u.id === session.user.id;
                  return (
                    <ClickableRow key={u.id} href={`/admin/users/${u.id}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{u.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-4 py-3">
                        <MajorBadge schoolSlug={u.schoolSlug} />
                      </td>
                      <td className="px-4 py-3 text-right">{u._count.attempts}</td>
                      <td className="px-4 py-3 text-right">{u._count.essays}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {u.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {u.lastSignInAt ? u.lastSignInAt.toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <form
                          action={updateUserRole}
                          className="flex justify-end items-center gap-2"
                        >
                          <input type="hidden" name="userId" value={u.id} />
                          <select
                            name="role"
                            defaultValue={u.role}
                            disabled={isSelf}
                            className="h-8 rounded-md border border-input bg-background px-2 text-xs disabled:opacity-50"
                            title={isSelf ? "You can't change your own role" : ""}
                          >
                            <option value="FREE">Free</option>
                            <option value="PAID">Paid</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                          <Button
                            type="submit"
                            size="sm"
                            variant="outline"
                            disabled={isSelf}
                          >
                            Save
                          </Button>
                        </form>
                      </td>
                    </ClickableRow>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Pagination q={q} role={roleFilter} page={page} totalPages={totalPages} />
    </div>
  );
}

function Pagination({
  q,
  role,
  page,
  totalPages,
}: {
  q: string;
  role: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  const linkFor = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/users${qs ? `?${qs}` : ""}`;
  };
  return (
    <div className="flex justify-end gap-2 text-sm">
      {page > 1 && (
        <Button asChild size="sm" variant="outline">
          <Link href={linkFor(page - 1)}>← Prev</Link>
        </Button>
      )}
      <span className="self-center text-muted-foreground">
        Page {page} / {totalPages}
      </span>
      {page < totalPages && (
        <Button asChild size="sm" variant="outline">
          <Link href={linkFor(page + 1)}>Next →</Link>
        </Button>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "ADMIN") return <Badge>Admin</Badge>;
  if (role === "PAID") return <Badge variant="success">Paid</Badge>;
  return <Badge variant="secondary">Free</Badge>;
}

function MajorBadge({ schoolSlug }: { schoolSlug: string | null }) {
  if (schoolSlug === "dsse") return <Badge variant="outline">DSSE</Badge>;
  if (schoolSlug === "ahss") return <Badge variant="outline">AHSS</Badge>;
  return <span className="text-xs text-muted-foreground">—</span>;
}
