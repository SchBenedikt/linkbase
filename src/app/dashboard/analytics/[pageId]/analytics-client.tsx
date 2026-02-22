'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { PageViewRecord, LinkClickRecord, Link as LinkType } from '@/lib/types';
import { DashboardNav } from '@/components/dashboard-nav';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AnalyticsPage() {
  const params = useParams();
  const pageId = params.pageId as string;
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Build 30-day date range
  const thirtyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  }, []);

  const viewsQuery = useMemoFirebase(
    () =>
      pageId
        ? query(
            collection(firestore, 'page_views'),
            where('pageId', '==', pageId),
            where('date', '>=', thirtyDaysAgo),
            orderBy('date')
          )
        : null,
    [firestore, pageId, thirtyDaysAgo]
  );

  const clicksQuery = useMemoFirebase(
    () =>
      pageId
        ? query(
            collection(firestore, 'link_clicks'),
            where('pageId', '==', pageId),
            where('date', '>=', thirtyDaysAgo),
            orderBy('date')
          )
        : null,
    [firestore, pageId, thirtyDaysAgo]
  );

  const linksQuery = useMemoFirebase(
    () =>
      pageId ? collection(firestore, 'pages', pageId, 'links') : null,
    [firestore, pageId]
  );

  const { data: pageViews, isLoading: viewsLoading } = useCollection<PageViewRecord>(viewsQuery);
  const { data: linkClicks, isLoading: clicksLoading } = useCollection<LinkClickRecord>(clicksQuery);
  const { data: links } = useCollection<LinkType>(linksQuery);

  // Generate full 30-day date array
  const dateRange = useMemo(() => {
    const dates: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  // Page views chart data (fill missing days with 0)
  const viewsChartData = useMemo(() => {
    const viewsByDate: Record<string, number> = {};
    (pageViews || []).forEach((v) => {
      viewsByDate[v.date] = (viewsByDate[v.date] || 0) + v.count;
    });
    return dateRange.map((date) => ({
      date: date.slice(5), // MM-DD
      views: viewsByDate[date] || 0,
    }));
  }, [pageViews, dateRange]);

  // Total views
  const totalViews = useMemo(
    () => (pageViews || []).reduce((sum, v) => sum + v.count, 0),
    [pageViews]
  );

  // Total clicks
  const totalClicks = useMemo(
    () => (linkClicks || []).reduce((sum, c) => sum + c.count, 0),
    [linkClicks]
  );

  // Clicks by linkId
  const clicksByLink = useMemo(() => {
    const map: Record<string, number> = {};
    (linkClicks || []).forEach((c) => {
      map[c.linkId] = (map[c.linkId] || 0) + c.count;
    });
    return map;
  }, [linkClicks]);

  // Most clicked link
  const mostClickedLink = useMemo(() => {
    const entries = Object.entries(clicksByLink);
    if (!entries.length) return null;
    const [topLinkId] = entries.sort(([, a], [, b]) => b - a)[0];
    return links?.find((l) => l.id === topLinkId) || null;
  }, [clicksByLink, links]);

  // Bar chart data
  const clicksChartData = useMemo(() => {
    return Object.entries(clicksByLink)
      .map(([linkId, count]) => {
        const link = links?.find((l) => l.id === linkId);
        return { name: link?.title || 'Untitled Link', clicks: count };
      })
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);
  }, [clicksByLink, links]);

  const isLoading = viewsLoading || clicksLoading;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-bold text-lg">Linkbase</Link>
            <DashboardNav />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Views (30d)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{totalViews.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks (30d)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{totalClicks.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Most Clicked Link</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold truncate">
                    {mostClickedLink ? mostClickedLink.title : '—'}
                  </p>
                  {mostClickedLink && (
                    <p className="text-sm text-muted-foreground">
                      {clicksByLink[mostClickedLink.id]} clicks
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Page views line chart */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Page Views (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={viewsChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Link clicks bar chart */}
            {clicksChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Link Clicks (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={clicksChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {clicksChartData.length === 0 && !isLoading && (
              <Card>
                <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                  No link click data yet.
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
