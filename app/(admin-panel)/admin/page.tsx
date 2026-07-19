import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function startOfDaysAgo(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

export default async function AdminOverview() {
  const now = new Date();
  const day7 = startOfDaysAgo(7);
  const day30 = startOfDaysAgo(30);

  const [
    totalUsers,
    freeUsers,
    paidUsers,
    adminUsers,
    newUsers7,
    signIns7,
    totalAttempts,
    attempts7,
    totalEssays,
    essays7,
    pv7,
    pv30,
    uniqueVisitors7Raw,
    recentAttempts,
    recentUsers,
    topPaths7,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "FREE" } }),
    db.user.count({ where: { role: "PAID" } }),
    db.user.count({ where: { role: "ADMIN" } }),
    db.user.count({ where: { createdAt: { gte: day7 } } }),
    db.user.count({ where: { lastSignInAt: { gte: day7 } } }),
    db.attempt.count(),
    db.attempt.count({ where: { startedAt: { gte: day7 } } }),
    db.essay.count(),
    db.essay.count({ where: { createdAt: { gte: day7 } } }),
    db.pageView.count({ where: { createdAt: { gte: day7 } } }),
    db.pageView.count({ where: { createdAt: { gte: day30 } } }),
    db.pageView.findMany({
      where: { createdAt: { gte: day7 } },
      distinct: ["visitorId"],
      select: { visitorId: true },
    }),
    db.attempt.findMany({
      orderBy: { startedAt: "desc" },
      take: 8,
      include: {
        user: { select: { email: true, name: true } },
        mockTest: { select: { title: true } },
      },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    }),
    db.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: day7 } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 6,
    }),
  ]);

  const uniqueVisitors7 = uniqueVisitors7Raw.length;

  const stats: Array<{ label: string; value: string | number; sub?: string }> = [
    { label: "Total users", value: totalUsers, sub: `${newUsers7} new this week` },
    { label: "Sign-ins (7d)", value: signIns7, sub: "based on last sign-in timestamps" },
    { label: "Attempts (7d)", value: attempts7, sub: `${totalAttempts} all-time` },
    { label: "Essays (7d)", value: essays7, sub: `${totalEssays} all-time` },
    { label: "Page views (7d)", value: pv7, sub: `${pv30} in last 30d` },
    { label: "Unique visitors (7d)", value: uniqueVisitors7 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground text-sm">
          Snapshot of activity across the platform. Data refreshed on load.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-3xl">{s.value}</CardTitle>
            </CardHeader>
            {s.sub && (
              <CardContent className="pt-0 text-xs text-muted-foreground">
                {s.sub}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>User plan breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Free</span>
              <Badge variant="secondary">{freeUsers}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Paid</span>
              <Badge variant="success">{paidUsers}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Admin</span>
              <Badge>{adminUsers}</Badge>
            </div>
            <div className="pt-2">
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href="/admin/users">Manage users →</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription>Top pages (7d)</CardDescription>
            <Button asChild size="sm" variant="ghost">
              <Link href="/admin/visitors">All visitors →</Link>
            </Button>
          </CardHeader>
          <CardContent className="text-sm">
            {topPaths7.length === 0 ? (
              <p className="text-muted-foreground">
                No page views recorded yet. Browse a page and this will populate on the next request.
              </p>
            ) : (
              <ul className="divide-y">
                {topPaths7.map((row) => (
                  <li key={row.path} className="flex items-center justify-between py-2">
                    <code className="text-xs truncate max-w-[70%]">{row.path}</code>
                    <span className="text-muted-foreground">{row._count.path}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent users</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/admin/users">View all →</Link>
            </Button>
          </CardHeader>
          <CardContent className="text-sm">
            {recentUsers.length === 0 ? (
              <p className="text-muted-foreground">No users yet.</p>
            ) : (
              <ul className="divide-y">
                {recentUsers.map((u) => (
                  <li key={u.id} className="flex items-center justify-between py-2 gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{u.name ?? u.email}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {u.email} · {u.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                    <RoleBadge role={u.role} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent attempts</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/admin/attempts">View all →</Link>
            </Button>
          </CardHeader>
          <CardContent className="text-sm">
            {recentAttempts.length === 0 ? (
              <p className="text-muted-foreground">No attempts yet.</p>
            ) : (
              <ul className="divide-y">
                {recentAttempts.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-2 gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {a.user.name ?? a.user.email}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {a.mode === "MOCK" ? a.mockTest?.title ?? "Mock" : `${a.sectionKey ?? ""} practice`} ·{" "}
                        {(a.submittedAt ?? a.startedAt).toLocaleString()}
                      </div>
                    </div>
                    {a.submittedAt ? (
                      <Badge variant="secondary">
                        {a.score ?? 0}/{a.totalQuestions ?? 0}
                      </Badge>
                    ) : (
                      <Badge variant="warning">In progress</Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-right">
        Rendered at {now.toLocaleString()}
      </p>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "ADMIN") return <Badge>Admin</Badge>;
  if (role === "PAID") return <Badge variant="success">Paid</Badge>;
  return <Badge variant="secondary">Free</Badge>;
}
