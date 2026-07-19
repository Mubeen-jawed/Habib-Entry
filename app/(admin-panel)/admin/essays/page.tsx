import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type Search = { q?: string; page?: string };

export default async function AdminEssaysPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const where: Prisma.EssayWhereInput = {};
  if (q) {
    where.OR = [
      { prompt: { contains: q } },
      { user: { email: { contains: q } } },
      { user: { name: { contains: q } } },
    ];
  }

  const [total, essays] = await Promise.all([
    db.essay.count({ where }),
    db.essay.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: { user: { select: { email: true, name: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Essays</h1>
          <p className="text-muted-foreground text-sm">
            {total} total · page {page} of {totalPages}
          </p>
        </div>
        <form className="flex gap-2 items-center" action="/admin/essays">
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search prompt or user…"
            className="w-72"
          />
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
                  <th className="px-4 py-3 font-medium">Prompt</th>
                  <th className="px-4 py-3 font-medium text-right">Words</th>
                  <th className="px-4 py-3 font-medium">Scores (R/A/W)</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {essays.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No essays yet.
                    </td>
                  </tr>
                )}
                {essays.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{e.user.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{e.user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/essay?open=${e.id}`}
                        className="line-clamp-2 hover:underline"
                      >
                        {e.prompt}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">{e.wordCount}</td>
                    <td className="px-4 py-3">
                      {e.readingScore != null || e.analysisScore != null || e.writingScore != null ? (
                        <Badge variant="success">
                          {e.readingScore ?? "-"}/{e.analysisScore ?? "-"}/{e.writingScore ?? "-"}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">Unrated</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {e.updatedAt.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-end gap-2 text-sm">
          {page > 1 && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/admin/essays?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page - 1) }).toString()}`}>
                ← Prev
              </Link>
            </Button>
          )}
          <span className="self-center text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/admin/essays?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page + 1) }).toString()}`}>
                Next →
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
