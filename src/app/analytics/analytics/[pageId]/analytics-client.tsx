'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, MousePointerClick, BarChart2, Percent } from 'lucide-react';
import Link from 'next/link';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { PageViewRecord, LinkClickRecord, Link as LinkType } from '@/lib/types';
import { DashboardNav } from '@/components/dashboard-nav';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';

type Range = 7 | 30 | 90;

/** Number of pixels allocated per bar item in the horizontal bar chart. */
const BAR_HEIGHT_PX = 36;
/** Minimum height (px) for the bar chart container. */
const BAR_CHART_MIN_HEIGHT = 200;

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: React.ElementType; sub?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const params = useParams();
  const pageId = params.pageId as string;
  const firestore = useFirestore();
  const [range, setRange] = useState<Range>(30);

  const cutoffDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - range);
    return d.toISOString().split('T')[0];
  }, [range]);

  const viewsQuery = useMemoFirebase(
    () => pageId && firestore
      ? query(collection(firestore, 'pages', pageId, 'page_views'), where('date', '>=', cutoffDate), orderBy('date'))
      : null,
    [firestore, pageId, cutoffDate]
  );

  const clicksQuery = useMemoFirebase(
    () => pageId && firestore
      ? query(collection(firestore, 'pages', pageId, 'link_clicks'), where('date', '>=', cutoffDate), orderBy('date'))
      : null,
    [firestore, pageId, cutoffDate]
  );

  const linksQuery = useMemoFirebase(
    () => pageId && firestore ? collection(firestore, 'pages', pageId, 'links') : null,
    [firestore, pageId]
  );

  const { data: pageViews, isLoading: viewsLoading } = useCollection<PageViewRecord>(viewsQuery);
  const { data: linkClicks, isLoading: clicksLoading } = useCollection<LinkClickRecord>(clicksQuery);
  const { data: links } = useCollection<LinkType>(linksQuery);

  const dateRange = useMemo(() => {
    const dates: string[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, [range]);

  const viewsChartData = useMemo(() => {
    const viewsByDate: Record<string, number> = {};
    (pageViews || []).forEach((v) => { viewsByDate[v.date] = (viewsByDate[v.date] || 0) + v.count; });
    return dateRange.map((date) => ({ date: date.slice(5), views: viewsByDate[date] || 0 }));
  }, [pageViews, dateRange]);

  const totalViews = useMemo(() => (pageViews || []).reduce((s, v) => s + v.count, 0), [pageViews]);
  const totalClicks = useMemo(() => (linkClicks || []).reduce((s, c) => s + c.count, 0), [linkClicks]);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  const clicksByLink = useMemo(() => {
    const map: Record<string, number> = {};
    (linkClicks || []).forEach((c) => { map[c.linkId] = (map[c.linkId] || 0) + c.count; });
    return map;
  }, [linkClicks]);

  const mostClickedLink = useMemo(() => {
    const entries = Object.entries(clicksByLink);
    if (!entries.length) return null;
    const [topLinkId] = entries.sort(([, a], [, b]) => b - a)[0];
    return links?.find((l) => l.id === topLinkId) || null;
  }, [clicksByLink, links]);

  const clicksChartData = useMemo(() => {
    return Object.entries(clicksByLink)
      .map(([linkId, count]) => {
        const link = links?.find((l) => l.id === linkId);
        return { name: link?.title || 'Untitled', clicks: count };
      })
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);
  }, [clicksByLink, links]);

  // Daily avg
  const avgViewsPerDay = range > 0 ? (totalViews / range).toFixed(1) : '0';

  const isLoading = viewsLoading || clicksLoading;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <DashboardNav />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/analytics">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Pages
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          </div>
          {/* Time range selector */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            {([7, 30, 90] as Range[]).map((r) => (
              <Button
                key={r}
                variant={range === r ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setRange(r)}
              >
                {r}d
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-2 md:grid-cols-4 mb-8">
              <StatCard label={`Total Views (${range}d)`} value={totalViews} icon={TrendingUp} sub={`~${avgViewsPerDay}/day`} />
              <StatCard label={`Total Clicks (${range}d)`} value={totalClicks} icon={MousePointerClick} />
              <StatCard label="Click-Through Rate" value={`${ctr}%`} icon={Percent} sub="Clicks / Views" />
              <StatCard
                label="Most Clicked"
                value={mostClickedLink ? mostClickedLink.title : '—'}
                icon={BarChart2}
                sub={mostClickedLink ? `${clicksByLink[mostClickedLink.id]} clicks` : undefined}
              />
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Page Views (Last {range} Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={viewsChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    {/* Show every tick for 7d, every 5th for 30d, every 9th for 90d */}
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={range === 7 ? 0 : range === 30 ? 4 : 8} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {clicksChartData.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Link Clicks (Last {range} Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={Math.max(BAR_CHART_MIN_HEIGHT, clicksChartData.length * BAR_HEIGHT_PX)}>
                    <BarChart data={clicksChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                  No link click data in the last {range} days.
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
