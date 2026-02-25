'use client';

import { useState, useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardNav } from '@/components/dashboard-nav';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Link2,
  Globe,
  ArrowRight,
  BarChart2
} from 'lucide-react';
import Link from 'next/link';
import type { ShortLink, Page } from '@/lib/types';

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

  // Calculate real stats
  const stats = useMemo(() => {
    if (!links && !pages) return null;

    const totalLinks = links?.length || 0;
    const totalClicks = links?.reduce((sum, link) => sum + (link.clickCount || 0), 0) || 0;
    const totalPages = pages?.length || 0;
    const publishedPages = pages?.filter(p => p.status === 'published').length || 0;

    // Top performing link
    const topLink = links?.length ? links.reduce((top, link) => 
      (link.clickCount || 0) > (top.clickCount || 0) ? link : top) : null;

    // Recent activity (last 7 days)
    const recentLinks = links?.filter(link => {
      const createdAt = link.createdAt?.toDate?.();
      if (!createdAt) return false;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return createdAt > sevenDaysAgo;
    }).length || 0;

    return {
      totalLinks,
      totalClicks,
      totalPages,
      publishedPages,
      topLink,
      recentLinks,
      avgClicksPerLink: totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0,
    };
  }, [links, pages]);

  const isLoading = isUserLoading || areLinksLoading || arePagesLoading;

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
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <Badge variant="secondary" className="text-sm">
            Real-time data
          </Badge>
        </div>

        {/* Overview Stats */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Links</CardTitle>
                <Link2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLinks}</div>
                <p className="text-xs text-muted-foreground">
                  Active short links
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClicks}</div>
                <p className="text-xs text-muted-foreground">
                  All-time clicks
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
                <CardTitle className="text-sm font-medium">Avg. Clicks</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgClicksPerLink}</div>
                <p className="text-xs text-muted-foreground">
                  Per link average
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Selection Interface */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setView('pages')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Page Analytics
              </CardTitle>
              <CardDescription>
                View detailed analytics for your pages including views, clicks, and visitor behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats?.publishedPages || 0}</div>
                  <p className="text-sm text-muted-foreground">Published pages</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setView('links')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                Short Link Analytics
              </CardTitle>
              <CardDescription>
                Track performance of your short links with click counts and popular destinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats?.totalLinks || 0}</div>
                  <p className="text-sm text-muted-foreground">Active links</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Page Analytics View */}
        {view === 'pages' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Page Analytics
              </CardTitle>
              <CardDescription>
                Select a page to view detailed analytics with views, clicks, and time-based data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/analytics/analytics">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  View Page Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Short Links Analytics View */}
        {view === 'links' && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Performing Links
                </CardTitle>
                <CardDescription>
                  Your most clicked short links
                </CardDescription>
              </CardHeader>
              <CardContent>
                {links && links.length > 0 ? (
                  <div className="space-y-4">
                    {links
                      .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
                      .slice(0, 10)
                      .map((link, index) => (
                        <Link key={link.id} href={`/analytics/${link.id}`} className="block group">
                          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate group-hover:underline">{link.title || 'Untitled'}</p>
                              <p className="text-xs text-muted-foreground">/s/{link.code}</p>
                              <p className="text-xs text-muted-foreground truncate">{link.originalUrl}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {link.clickCount || 0} clicks
                              </Badge>
                              {index === 0 && (
                                <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                                  #1
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No links yet</p>
                    <Button asChild className="mt-4">
                      <Link href="/links">Create your first short link</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Link Statistics Summary */}
            {links && links.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Link Statistics
                  </CardTitle>
                  <CardDescription>
                    Summary of your short link performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats?.totalClicks || 0}</div>
                      <p className="text-sm text-muted-foreground">Total Clicks</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats?.avgClicksPerLink || 0}</div>
                      <p className="text-sm text-muted-foreground">Avg. Clicks per Link</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats?.recentLinks || 0}</div>
                      <p className="text-sm text-muted-foreground">Created in last 7 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
