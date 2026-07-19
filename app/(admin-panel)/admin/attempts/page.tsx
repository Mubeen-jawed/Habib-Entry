import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

type Search = { q?: string; mode?: string; page?: string };

export default async function AdminAttemptsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const modeFilter = sp.mode && ["MOCK", "PRACTICE"].includes(sp.mode) ? sp.mode : "";
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const where: Prisma.AttemptWhereInput = {};
  if (q) {
    where.user = {
      OR: [
        { email: { contains: q } },
        { name: { contains: q } },
      ],
    };
  }
  if (modeFilter) where.mode = modeFilter;

  const [total, attempts] = await Promise.all([
    db.attempt.count({ where }),
    db.attempt.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: {
        user: { select: { id: true, email: true, name: true } },
        mockTest: { select: { title: true } },
        _count: { select: { answers: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Attempts</h1>
          <p className="text-muted-foreground text-sm">
            {total} total · showing page {page} of {totalPages}
          </p>
        </div>
        <form className="flex gap-2 items-center" action="/admin/attempts">
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search by user…"
            className="w-64"
          />
          <select
            name="mode"
            defaultValue={modeFilter}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All modes</option>
            <option value="MOCK">Mock</option>
            <option value="PRACTICE">Practice</option>
          </select>
          <Button type="submit" variant="outline" size="sm">Filter</Button>
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Started</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium text-right">Score</th>
                  <th className="px-4 py-3 font-medium text-right">Answers</th>
                  <th className="px-4 py-3 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody>
                {attempts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No attempts match those filters.
                    </td>
                  </tr>
                )}
                {attempts.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{a.user.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{a.user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      {a.mode === "MOCK" ? (
                        <Badge>{a.mockTest?.title ?? "Mock"}</Badge>
                      ) : (
                        <Badge variant="secondary">
                          {a.sectionKey ?? "Practice"}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.startedAt.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.submittedAt ? (
                        a.submittedAt.toLocaleString()
                      ) : (
                        <Badge variant="warning">In progress</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {a.submittedAt
                        ? `${a.score ?? 0} / ${a.totalQuestions ?? 0}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">{a._count.answers}</td>
                    <td className="px-4 py-3 text-right">
                      {a.submittedAt && (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/attempts/${a.id}`}>Review</Link>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Pagination q={q} mode={modeFilter} page={page} totalPages={totalPages} />
    </div>
  );
}

function Pagination({
  q,
  mode,
  page,
  totalPages,
}: {
  q: string;
  mode: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  const linkFor = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (mode) params.set("mode", mode);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/attempts${qs ? `?${qs}` : ""}`;
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
