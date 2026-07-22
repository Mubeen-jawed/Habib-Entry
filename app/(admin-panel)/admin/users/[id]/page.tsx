import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SECTION_NAMES, type SectionKey } from "@/lib/sections";
import { SCHOOLS, type SchoolSlug } from "@/lib/schools";
import { DeleteUserButton } from "../DeleteUserButton";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();
  const { id } = await params;
  const isSelf = session.user.id === id;

  const user = await db.user.findUnique({
    where: { id },
    include: {
      _count: { select: { attempts: true, essays: true, sessions: true } },
    },
  });
  if (!user) notFound();

  const [practiceAttempts, essays] = await Promise.all([
    db.attempt.findMany({
      where: { userId: id, mode: "PRACTICE" },
      orderBy: { startedAt: "desc" },
      include: { _count: { select: { answers: true } } },
    }),
    db.essay.findMany({
      where: { userId: id },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const school =
    user.schoolSlug === "dsse" || user.schoolSlug === "ahss"
      ? SCHOOLS[user.schoolSlug as SchoolSlug]
      : null;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" /> Back to users
          </Link>
        </Button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {user.name ?? "—"}
            </h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RoleBadge role={user.role} />
            {school ? (
              <Badge variant="outline">{school.code} · {school.name}</Badge>
            ) : (
              <Badge variant="warning">No school picked</Badge>
            )}
            {!isSelf && (
              <DeleteUserButton
                userId={user.id}
                email={user.email}
                redirectTo="/admin/users"
                variant="full"
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Practice attempts" value={practiceAttempts.length} />
        <StatCard label="Essays written" value={essays.length} />
        <StatCard
          label="Joined"
          value={user.createdAt.toLocaleDateString()}
        />
        <StatCard
          label="Last sign-in"
          value={user.lastSignInAt ? user.lastSignInAt.toLocaleString() : "—"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Practice tests ({practiceAttempts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Section</th>
                  <th className="px-4 py-3 font-medium">Started</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium text-right">Score</th>
                  <th className="px-4 py-3 font-medium text-right">Answers</th>
                  <th className="px-4 py-3 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody>
                {practiceAttempts.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No practice attempts yet.
                    </td>
                  </tr>
                )}
                {practiceAttempts.map((a) => {
                  const sectionKey = a.sectionKey as SectionKey | null;
                  const sectionName = sectionKey
                    ? SECTION_NAMES[sectionKey] ?? sectionKey
                    : "Practice";
                  return (
                    <tr key={a.id} className="border-t">
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{sectionName}</Badge>
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
                      <td className="px-4 py-3 text-right">
                        {a._count.answers}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {a.submittedAt && (
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/attempts/${a.id}`}>Review</Link>
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Essays ({essays.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Prompt</th>
                  <th className="px-4 py-3 font-medium text-right">Words</th>
                  <th className="px-4 py-3 font-medium">Scores (R/A/W)</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {essays.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No essays yet.
                    </td>
                  </tr>
                )}
                {essays.map((e) => (
                  <tr key={e.id} className="border-t align-top">
                    <td className="px-4 py-3">
                      <Link
                        href={`/essay?open=${e.id}`}
                        className="hover:underline line-clamp-2 font-medium"
                      >
                        {e.prompt}
                      </Link>
                      {e.text && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {e.text}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">{e.wordCount}</td>
                    <td className="px-4 py-3">
                      {e.readingScore != null ||
                      e.analysisScore != null ||
                      e.writingScore != null ? (
                        <Badge variant="success">
                          {e.readingScore ?? "-"}/{e.analysisScore ?? "-"}/
                          {e.writingScore ?? "-"}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Unrated
                        </span>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {user.interviewSubmittedAt ? (
            <>
              <div className="flex items-center gap-2">
                <Badge variant="success">Submitted</Badge>
                <span className="text-muted-foreground">
                  {user.interviewSubmittedAt.toLocaleString()}
                </span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Full interview responses (field, WhatsApp, uploads, etc.) are
                forwarded to the external interview webhook and are not stored
                in this database.
              </p>
            </>
          ) : (
            <>
              <Badge variant="warning">Not submitted</Badge>
              <p className="text-muted-foreground text-xs">
                This user hasn&apos;t signed up for a mock interview yet.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xl font-semibold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "ADMIN") return <Badge>Admin</Badge>;
  if (role === "PAID") return <Badge variant="success">Paid</Badge>;
  return <Badge variant="secondary">Free</Badge>;
}
