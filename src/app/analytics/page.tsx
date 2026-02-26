'use client';

import { useState, useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BarChart2,
  ArrowUp,
  ArrowDown,
  Activity,
  Zap,
  Target,
  Calendar,
  Download,
  RefreshCw,
  Sparkles
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

  // Calculate enhanced stats
  const stats = useMemo(() => {
    if (!links && !pages) return null;

    const totalLinks = links?.length || 0;
    const totalClicks = links?.reduce((sum, link) => sum + (link.clickCount || 0), 0) || 0;
    const totalPages = pages?.length || 0;
    const publishedPages = pages?.filter(p => p.status === 'published').length || 0;
    const draftPages = pages?.filter(p => p.status === 'draft').length || 0;

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

    // Calculate trends (mock data for now)
    const clickGrowth = 8; // percentage
    const linkGrowth = 12; // percentage
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
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-2">
                Analytics
                <Sparkles className="h-8 w-8 text-yellow-500" />
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Track your content performance and user engagement
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <Activity className="mr-1 h-3 w-3" />
                Real-time
              </Badge>
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Overview Stats */}
        {stats && (
          <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="relative overflow-hidden group transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Links</CardTitle>
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Link2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">{stats.totalLinks}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-green-600 text-xs">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    {stats.linkGrowth}%
                  </div>
                  <span className="text-xs text-muted-foreground">vs last week</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active short links
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden group transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-16 -mt-16" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <MousePointer className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">{stats.totalClicks}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-green-600 text-xs">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    {stats.clickGrowth}%
                  </div>
                  <span className="text-xs text-muted-foreground">vs last week</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All-time clicks
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden group transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pages</CardTitle>
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">{stats.publishedPages}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={stats.totalPages > 0 ? (stats.publishedPages / stats.totalPages) * 100 : 0} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground">{stats.publishedPages}/{stats.totalPages}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Published pages
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden group transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -mr-16 -mt-16" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Engagement</CardTitle>
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">{stats.engagementRate}%</div>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={stats.engagementRate} className="flex-1 h-2" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Click rate per link
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
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="group cursor-pointer transition-all duration-300 border-l-4 border-l-blue-500" onClick={() => setView('pages')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
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
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>

              <Card className="group cursor-pointer transition-all duration-300 border-l-4 border-l-green-500" onClick={() => setView('links')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-green-600" />
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
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Performance Summary
                </CardTitle>
                <CardDescription>
                  Key metrics at a glance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats?.totalClicks || 0}</div>
                    <p className="text-sm text-muted-foreground mt-1">Total Clicks</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats?.avgClicksPerLink || 0}</div>
                    <p className="text-sm text-muted-foreground mt-1">Avg. Clicks</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats?.recentLinks || 0}</div>
                    <p className="text-sm text-muted-foreground mt-1">New Links (7d)</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats?.engagementRate || 0}%</div>
                    <p className="text-sm text-muted-foreground mt-1">Engagement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  Page Analytics
                </CardTitle>
                <CardDescription>
                  Select a page to view detailed analytics with views, clicks, and time-based data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full group">
                  <Link href="/analytics/analytics">
                    <BarChart2 className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                    View Page Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="links" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
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
                          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all duration-200 hover:shadow-sm">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                  {link.title || 'Untitled'}
                                </p>
                                {index === 0 && (
                                  <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                                    #1
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">/s/{link.code}</p>
                              <p className="text-xs text-muted-foreground truncate">{link.originalUrl}</p>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <div className="text-right">
                                <div className="text-lg font-bold text-primary">{link.clickCount || 0}</div>
                                <p className="text-xs text-muted-foreground">clicks</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No links yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Create short links to see analytics here</p>
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
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Link Statistics
                  </CardTitle>
                  <CardDescription>
                    Summary of your short link performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{stats?.totalClicks || 0}</div>
                      <p className="text-sm text-muted-foreground mt-1">Total Clicks</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats?.avgClicksPerLink || 0}</div>
                      <p className="text-sm text-muted-foreground mt-1">Avg. Clicks per Link</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats?.recentLinks || 0}</div>
                      <p className="text-sm text-muted-foreground mt-1">Created in last 7 days</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <Button variant="outline" className="w-full gap-2">
                      <Download className="h-4 w-4" />
                      Export Analytics Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
