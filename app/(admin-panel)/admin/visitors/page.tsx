import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function startOfDaysAgo(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

function fmtUA(ua: string | null | undefined) {
  if (!ua) return "—";
  // Trim to a friendly-ish label without pulling in a UA parser.
  const short = ua.length > 80 ? ua.slice(0, 80) + "…" : ua;
  return short;
}

export default async function AdminVisitorsPage() {
  const day7 = startOfDaysAgo(7);
  const day30 = startOfDaysAgo(30);

  const [
    pv24h,
    pv7,
    pv30,
    uniques7Raw,
    uniques30Raw,
    topPaths,
    topReferers,
    recent,
    byDayRaw,
  ] = await Promise.all([
    db.pageView.count({ where: { createdAt: { gte: startOfDaysAgo(1) } } }),
    db.pageView.count({ where: { createdAt: { gte: day7 } } }),
    db.pageView.count({ where: { createdAt: { gte: day30 } } }),
    db.pageView.findMany({
      where: { createdAt: { gte: day7 } },
      distinct: ["visitorId"],
      select: { visitorId: true },
    }),
    db.pageView.findMany({
      where: { createdAt: { gte: day30 } },
      distinct: ["visitorId"],
      select: { visitorId: true },
    }),
    db.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: day7 } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 15,
    }),
    db.pageView.groupBy({
      by: ["referer"],
      where: { createdAt: { gte: day7 }, referer: { not: null } },
      _count: { referer: true },
      orderBy: { _count: { referer: "desc" } },
      take: 10,
    }),
    db.pageView.findMany({ orderBy: { createdAt: "desc" }, take: 40 }),
    db.$queryRaw<Array<{ day: string; views: number; visitors: number }>>`
      SELECT
        strftime('%Y-%m-%d', createdAt) AS day,
        COUNT(*) AS views,
        COUNT(DISTINCT visitorId) AS visitors
      FROM PageView
      WHERE createdAt >= ${day30}
      GROUP BY day
      ORDER BY day DESC
    `.catch(() => []),
  ]);

  const uniques7 = uniques7Raw.length;
  const uniques30 = uniques30Raw.length;
  const maxViews = Math.max(1, ...byDayRaw.map((r) => Number(r.views)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Visitors</h1>
        <p className="text-muted-foreground text-sm">
          Anonymous + logged-in page views recorded via middleware.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Views (24h)" value={pv24h} />
        <Stat label="Views (7d)" value={pv7} />
        <Stat label="Unique visitors (7d)" value={uniques7} />
        <Stat label="Unique visitors (30d)" value={uniques30} sub={`${pv30} views`} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Last 30 days</CardTitle>
          <CardDescription>Views and unique visitors per day.</CardDescription>
        </CardHeader>
        <CardContent>
          {byDayRaw.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {byDayRaw.map((r) => {
                const views = Number(r.views);
                const visitors = Number(r.visitors);
                const pct = Math.round((views / maxViews) * 100);
                return (
                  <li key={r.day} className="grid grid-cols-[110px_1fr_140px] items-center gap-3">
                    <span className="text-muted-foreground">{r.day}</span>
                    <div className="h-2 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full bg-brand"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-right text-xs text-muted-foreground">
                      {views} views · {visitors} visitors
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top pages (7d)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {topPaths.length === 0 ? (
              <p className="text-muted-foreground">No page views yet.</p>
            ) : (
              <ul className="divide-y">
                {topPaths.map((row) => (
                  <li key={row.path} className="flex items-center justify-between py-2 gap-3">
                    <code className="text-xs truncate">{row.path}</code>
                    <Badge variant="secondary">{row._count.path}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top referers (7d)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {topReferers.length === 0 ? (
              <p className="text-muted-foreground">No referers recorded.</p>
            ) : (
              <ul className="divide-y">
                {topReferers.map((row) => (
                  <li key={row.referer ?? "n"} className="flex items-center justify-between py-2 gap-3">
                    <span className="truncate text-xs">{row.referer ?? "—"}</span>
                    <Badge variant="secondary">{row._count.referer}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent activity</CardTitle>
          <CardDescription>Latest 40 page views.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Path</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Referer</th>
                  <th className="px-4 py-3 font-medium">UA</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((v) => (
                  <tr key={v.id} className="border-t align-top">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {v.createdAt.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs">{v.path}</code>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {v.userId ? (
                        <UserCell userId={v.userId} />
                      ) : (
                        <span className="text-muted-foreground">anon</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[220px]">
                      {v.referer ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[240px]">
                      {fmtUA(v.userAgent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      {sub && <CardContent className="pt-0 text-xs text-muted-foreground">{sub}</CardContent>}
    </Card>
  );
}

async function UserCell({ userId }: { userId: string }) {
  const u = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!u) return <span className="text-muted-foreground">deleted</span>;
  return (
    <div>
      <div className="font-medium truncate max-w-[160px]">{u.name ?? u.email}</div>
      {u.name && <div className="text-muted-foreground truncate max-w-[160px]">{u.email}</div>}
    </div>
  );
}
