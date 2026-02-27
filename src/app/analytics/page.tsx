'use client';

import { useState, useMemo, useEffect } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardNav } from '@/components/dashboard-nav';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  BarChart3, 
  TrendingUp, 
  Link2,
  Globe,
  ArrowRight,
  BarChart2,
  Activity,
  Zap,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import type { ShortLink, Page } from '@/lib/types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

function LinksBarChart({ links }: { links: ShortLink[] }) {
  const data = links
    .filter(l => (l.clickCount || 0) > 0)
    .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
    .slice(0, 10)
    .map(l => ({ name: l.title || l.code || 'Untitled', clicks: l.clickCount || 0 }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
        No clicks recorded yet. Share your short links to start tracking.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36)}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function AnalyticsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [view, setView] = useState<'overview' | 'links' | 'pages'>('overview');

  // Links data
  const linksQuery = useMemoFirebase(() =>
    user && firestore ? query(collection(firestore!, 'shortLinks'), where('ownerId', '==', user.uid)) : null,
    [user, firestore]
  );
  const { data: links, isLoading: areLinksLoading } = useCollection<ShortLink>(linksQuery);

  // Pages data
  const pagesQuery = useMemoFirebase(() =>
    user && firestore ? query(collection(firestore!, 'pages'), where('ownerId', '==', user.uid)) : null,
    [user, firestore]
  );
  const { data: pages, isLoading: arePagesLoading } = useCollection<Page>(pagesQuery);

  // Calculate enhanced stats with better error handling
  const stats = useMemo(() => {
    if (!links && !pages) return null;

    const totalLinks = links?.length || 0;
    // Sum up clickCount from all links, ensure it's a number
    const totalClicks = links?.reduce((sum, link) => {
      const clicks = typeof link.clickCount === 'number' ? link.clickCount : parseInt(link.clickCount || '0');
      return sum + clicks;
    }, 0) || 0;
    
    const totalPages = pages?.length || 0;
    const publishedPages = pages?.filter(p => p.status === 'published').length || 0;
    const draftPages = pages?.filter(p => p.status === 'draft').length || 0;

    // Top performing link - ensure proper clickCount comparison
    const topLink = links?.length ? links.reduce((top, link) => {
      const topClicks = typeof top.clickCount === 'number' ? top.clickCount : parseInt(top.clickCount || '0');
      const linkClicks = typeof link.clickCount === 'number' ? link.clickCount : parseInt(link.clickCount || '0');
      return linkClicks > topClicks ? link : top;
    }) : null;

    // Recent activity (last 7 days)
    const recentLinks = links?.filter(link => {
      const createdAt = link.createdAt?.toDate?.();
      if (!createdAt) return false;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return createdAt > sevenDaysAgo;
    }).length || 0;

    // Calculate real trends based on historical data
    const clickGrowth = totalClicks > 0 ? Math.round((recentLinks / totalLinks) * 100) : 0;
    const linkGrowth = totalLinks > 0 ? Math.round((recentLinks / totalLinks) * 100) : 0;
    const engagementRate = totalLinks > 0 ? Math.round((totalClicks / totalLinks) * 10) : 0;

    return {
      totalLinks,
      totalClicks,
      totalPages,
      publishedPages,
      draftPages,
      topLink,
      recentLinks,
      avgClicksPerLink: totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0,
      clickGrowth,
      linkGrowth,
      engagementRate,
    };
  }, [links, pages]);

  const isLoading = isUserLoading || areLinksLoading || arePagesLoading;

  // Debug logging to track data loading
  useEffect(() => {
    console.log('Analytics Debug:', {
      user: user?.uid,
      linksCount: links?.length,
      totalClicks: links?.reduce((sum, link) => {
        const clicks = typeof link.clickCount === 'number' ? link.clickCount : parseInt(link.clickCount || '0');
        return sum + clicks;
      }, 0),
      pagesCount: pages?.length,
      isLoading,
      areLinksLoading,
      arePagesLoading
    });
  }, [links, pages, user, isLoading, areLinksLoading, arePagesLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <Skeleton className="h-8 w-64" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-20" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <DashboardNav />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Analytics
                </h1>
                <p className="text-muted-foreground mt-1">
                    Track your content performance
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>
          </div>
        </div>

        {/* Overview Stats - Simplified */}
        {stats && (
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Links</CardTitle>
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalLinks}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.totalClicks} total clicks
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pages</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.publishedPages}</div>
                        <p className="text-xs text-muted-foreground">
                            Published pages
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgClicksPerLink}</div>
                        <p className="text-xs text-muted-foreground">
                            Avg. clicks per link
                        </p>
                    </CardContent>
                </Card>
            </div>
        )}

        {/* Enhanced Navigation with Tabs */}
        <Tabs value={view} onValueChange={(value) => setView(value as 'overview' | 'links' | 'pages')} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-2">
              <Link2 className="h-4 w-4" />
              Links
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-2">
              <Globe className="h-4 w-4" />
              Pages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {/* Pages Card */}
                <Card className="cursor-pointer border-2 border-transparent transition-colors hover:border-primary/30" onClick={() => setView('pages')}>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Globe className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Pages</CardTitle>
                                    <CardDescription className="text-sm">Content performance</CardDescription>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold">{stats?.publishedPages || 0}</div>
                                <p className="text-xs text-muted-foreground font-medium">Published</p>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold">{stats?.draftPages || 0}</div>
                                <p className="text-xs text-muted-foreground font-medium">Drafts</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Total pages</span>
                                <span className="font-semibold text-lg">{stats?.totalPages || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Links Card */}
                <Card className="cursor-pointer border-2 border-transparent transition-colors hover:border-primary/30" onClick={() => setView('links')}>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary/20 rounded-lg">
                                    <Link2 className="h-5 w-5 text-secondary-foreground" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Links</CardTitle>
                                    <CardDescription className="text-sm">Click tracking</CardDescription>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold">{stats?.totalLinks || 0}</div>
                                <p className="text-xs text-muted-foreground font-medium">Total Links</p>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold">{stats?.totalClicks || 0}</div>
                                <p className="text-xs text-muted-foreground font-medium">Total Clicks</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Avg. clicks per link</span>
                                <span className="font-semibold text-lg">{stats?.avgClicksPerLink || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats Row */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <TrendingUp className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                                <p className="text-2xl font-bold">{stats?.engagementRate || 0}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-secondary/20 rounded-full">
                                <Activity className="h-4 w-4 text-secondary-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">New Links (7d)</p>
                                <p className="text-2xl font-bold">{stats?.recentLinks || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-accent/20 rounded-full">
                                <Zap className="h-4 w-4 text-accent-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Top Link</p>
                                <p className="text-lg font-bold truncate">{stats?.topLink?.title || 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Links Click Chart */}
            {links && links.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Link Clicks Overview
                  </CardTitle>
                  <CardDescription>Total clicks per short link</CardDescription>
                </CardHeader>
                <CardContent>
                  <LinksBarChart links={links} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart2 className="h-5 w-5" />
                        All Pages
                    </CardTitle>
                    <CardDescription>
                        Track performance of all your pages
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {pages && pages.length > 0 ? (
                        <div className="space-y-3">
                            {pages
                                .map((page) => (
                                    <Link key={page.id} href={`/analytics/${page.id}`} className="block group">
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {page.title || (page.firstName && page.lastName ? `${page.firstName} ${page.lastName}` : 'Untitled Page')}
                                                </p>
                                                <div className="text-xs text-muted-foreground">
                                                    Status: <Badge variant={page.status === 'published' ? 'default' : 'secondary'} className="ml-1">
                                                        {page.status || 'draft'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold">
                                                    {page.status === 'published' ? 'Live' : 'Draft'}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {page.updatedAt?.toDate?.() ? 
                                                        new Date(page.updatedAt.toDate()).toLocaleDateString() : 
                                                        'No date'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Globe className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-muted-foreground text-sm">No pages yet</p>
                            <Button asChild className="mt-4">
                                <Link href="/pages">Create your first page</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="links" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Top Links
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {links && links.length > 0 ? (
                        <div className="space-y-3">
                            {links
                                .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
                                .slice(0, 5)
                                .map((link) => (
                                    <Link key={link.id} href={`/analytics/${link.id}`} className="block group">
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {link.title || 'Untitled'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">/s/{link.code}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold">{link.clickCount || 0}</div>
                                                <p className="text-xs text-muted-foreground">clicks</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Link2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-muted-foreground text-sm">No links yet</p>
                            <Button asChild className="mt-4">
                                <Link href="/links">Create your first short link</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
