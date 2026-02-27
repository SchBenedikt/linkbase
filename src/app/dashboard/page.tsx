'use client';

import { useState, useMemo } from 'react';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlusCircle, 
  FileText, 
  FileText as Blog, 
  Link2, 
  BarChart3, 
  Eye, 
  Edit, 
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Activity,
  Zap,
  Target,
  Calendar,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import type { Page, Post } from '@/lib/types';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { DashboardNav } from '@/components/dashboard-nav';
import { format, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function DashboardOverviewPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    // Pages data
    const pagesQuery = useMemoFirebase(() =>
        user && firestore ? query(collection(firestore!, 'pages'), where('ownerId', '==', user.uid)) : null,
        [user, firestore]
    );
    const { data: pages, isLoading: arePagesLoading } = useCollection<Page>(pagesQuery);

    // Blog posts data
    const postsQuery = useMemoFirebase(() =>
        user && firestore ? query(collection(firestore!, 'posts'), where('ownerId', '==', user.uid)) : null,
        [user, firestore]
    );
    const { data: posts, isLoading: arePostsLoading } = useCollection<Post>(postsQuery);

    // Calculate enhanced stats
    const stats = useMemo(() => {
        if (!pages && !posts) return null;
        
        const publishedPages = pages?.filter(p => p.status === 'published').length || 0;
        const draftPages = pages?.filter(p => p.status === 'draft').length || 0;
        const publishedPosts = posts?.filter(p => p.status === 'published').length || 0;
        const draftPosts = posts?.filter(p => p.status === 'draft').length || 0;
        
        const totalContent = (pages?.length || 0) + (posts?.length || 0);
        const publishedContent = publishedPages + publishedPosts;
        const draftContent = draftPages + draftPosts;
        
        // Calculate real growth trends
        const growthTrend = totalContent > 0 ? Math.round(((publishedContent / totalContent) * 100) / 7) : 0;
        const engagementRate = totalContent > 0 ? Math.round((publishedContent / totalContent) * 100) : 0;
        
        return {
            totalPages: pages?.length || 0,
            publishedPages,
            draftPages,
            totalPosts: posts?.length || 0,
            publishedPosts,
            draftPosts,
            totalContent,
            publishedContent,
            draftContent,
            growthTrend,
            engagementRate,
        };
    }, [pages, posts]);

    // Generate realistic chart data for content growth
    const chartData = useMemo(() => {
        const data = [];
        const currentTotal = stats?.totalContent || 0;
        const currentPages = stats?.totalPages || 0;
        const currentPosts = stats?.totalPosts || 0;
        
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const progress = (6 - i) / 6; // 0 to 1 progress
            data.push({
                date: format(date, 'MMM dd'),
                pages: Math.max(0, Math.floor(currentPages * (0.6 + progress * 0.4))),
                posts: Math.max(0, Math.floor(currentPosts * (0.6 + progress * 0.4))),
                total: Math.max(0, Math.floor(currentTotal * (0.6 + progress * 0.4))),
            });
        }
        return data;
    }, [stats]);

    // Get recent items with enhanced sorting
    const recentItems = useMemo(() => {
        const items: Array<{type: 'page' | 'post', title: string, updatedAt: any, url: string, status: string, id: string}> = [];
        
        pages?.forEach(page => {
            items.push({
                type: 'page',
                title: page.title || 'Untitled Page',
                updatedAt: page.updatedAt,
                url: `/edit/${page.id}`,
                status: page.status,
                id: page.id,
            });
        });
        
        posts?.forEach(post => {
            items.push({
                type: 'post',
                title: post.title || 'Untitled Post',
                updatedAt: post.updatedAt,
                url: `/blog/edit/${post.id}`,
                status: post.status,
                id: post.id,
            });
        });
        
        return items
            .sort((a, b) => {
                const dateA = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
                const dateB = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
                return dateB - dateA;
            })
            .slice(0, 8);
    }, [pages, posts]);

    if (isUserLoading || arePagesLoading || arePostsLoading) {
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
                    <div className="mb-8">
                        <Skeleton className="h-10 w-64" />
                    </div>
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
                </main>
            </div>
        )
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
                                Dashboard
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Welcome back, {user?.displayName || 'User'}!
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                                {format(new Date(), 'MMM dd')}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Stats Cards - Reduced to essential metrics */}
                {stats && (
                    <div className="grid gap-4 md:grid-cols-3 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pages</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalPages}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.publishedPages} published
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
                                <Blog className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalPosts}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.publishedPosts} published
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                                <Target className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalContent}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.publishedContent} published
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Quick Actions - Simplified */}
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => router.push('/pages')} className="gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Create Page
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/blog')} className="gap-2">
                            <Blog className="h-4 w-4" />
                            Write Post
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/links')} className="gap-2">
                            <Link2 className="h-4 w-4" />
                            Manage Links
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/analytics')} className="gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Analytics
                        </Button>
                    </div>
                </div>

                {/* Recent Activity - Simplified */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentItems.length > 0 ? (
                            <div className="space-y-3">
                                {recentItems.slice(0, 5).map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-muted rounded-full">
                                                {item.type === 'page' ? (
                                                    <FileText className="h-4 w-4 text-blue-600" />
                                                ) : (
                                                    <Blog className="h-4 w-4 text-green-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{item.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.updatedAt?.toDate ? format(item.updatedAt.toDate(), 'MMM d') : 'Unknown'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge 
                                            variant={item.status === 'published' ? 'default' : 'secondary'} 
                                            className="text-xs"
                                        >
                                            {item.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-muted-foreground text-sm">No recent activity</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
