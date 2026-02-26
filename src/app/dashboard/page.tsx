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
        
        // Calculate growth trends (mock data for now)
        const growthTrend = 12; // percentage
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

    // Generate chart data for content growth
    const chartData = useMemo(() => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            data.push({
                date: format(date, 'MMM dd'),
                pages: Math.floor(Math.random() * 5) + (stats?.totalPages || 0) - 3,
                posts: Math.floor(Math.random() * 3) + (stats?.totalPosts || 0) - 2,
                total: Math.floor(Math.random() * 8) + (stats?.totalContent || 0) - 5,
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
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-2">
                                Dashboard
                                <Sparkles className="h-8 w-8 text-yellow-500" />
                            </h1>
                            <p className="text-muted-foreground text-lg mt-2">
                                Welcome back, {user?.displayName || 'User'}! Here's your content overview.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-sm px-3 py-1">
                                <Activity className="mr-1 h-3 w-3" />
                                Active
                            </Badge>
                            <Badge variant="outline" className="text-sm px-3 py-1">
                                <Calendar className="mr-1 h-3 w-3" />
                                {format(new Date(), 'MMM dd')}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Enhanced Stats Cards */}
                {stats && (
                    <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-8">
                        <Card className="relative overflow-hidden group transition-all duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Pages</CardTitle>
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl sm:text-3xl font-bold">{stats.totalPages}</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <Progress value={stats.totalPages > 0 ? (stats.publishedPages / stats.totalPages) * 100 : 0} className="flex-1 h-2" />
                                    <span className="text-xs text-muted-foreground">{stats.publishedPages}/{stats.totalPages}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.publishedPages} published, {stats.draftPages} drafts
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card className="relative overflow-hidden group transition-all duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Blog Posts</CardTitle>
                                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                                    <Blog className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl sm:text-3xl font-bold">{stats.totalPosts}</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <Progress value={stats.totalPosts > 0 ? (stats.publishedPosts / stats.totalPosts) * 100 : 0} className="flex-1 h-2" />
                                    <span className="text-xs text-muted-foreground">{stats.publishedPosts}/{stats.totalPosts}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.publishedPosts} published, {stats.draftPosts} drafts
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card className="relative overflow-hidden group transition-all duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Content</CardTitle>
                                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                                    <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl sm:text-3xl font-bold">{stats.totalContent}</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center text-green-600 text-xs">
                                        <ArrowUp className="h-3 w-3 mr-1" />
                                        {stats.growthTrend}%
                                    </div>
                                    <span className="text-xs text-muted-foreground">growth</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.publishedContent} published, {stats.draftContent} drafts
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
                                    Content engagement rate
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Enhanced Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Quick Actions
                    </h2>
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="group transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500" onClick={() => router.push('/pages')}>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full group-hover:scale-110 transition-transform">
                                        <PlusCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">Create Page</h3>
                                        <p className="text-sm text-muted-foreground">Build a new page</p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="group transition-all duration-300 cursor-pointer border-l-4 border-l-green-500" onClick={() => router.push('/blog')}>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full group-hover:scale-110 transition-transform">
                                        <Blog className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">Write Post</h3>
                                        <p className="text-sm text-muted-foreground">Create blog content</p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="group transition-all duration-300 cursor-pointer border-l-4 border-l-purple-500" onClick={() => router.push('/links')}>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full group-hover:scale-110 transition-transform">
                                        <Link2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">Manage Links</h3>
                                        <p className="text-sm text-muted-foreground">Short links</p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="group transition-all duration-300 cursor-pointer border-l-4 border-l-orange-500" onClick={() => router.push('/analytics')}>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full group-hover:scale-110 transition-transform">
                                        <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">View Analytics</h3>
                                        <p className="text-sm text-muted-foreground">Track performance</p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Content Growth Chart */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Content Growth
                        </CardTitle>
                        <CardDescription>
                            Track your content creation over the past 7 days
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 sm:h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis 
                                        dataKey="date" 
                                        tick={{ fontSize: 12 }}
                                        tickLine={{ stroke: 'hsl(var(--border))' }}
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 12 }}
                                        tickLine={{ stroke: 'hsl(var(--border))' }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: 'var(--radius)'
                                        }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="total" 
                                        stroke="hsl(var(--primary))" 
                                        strokeWidth={3}
                                        dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="pages" 
                                        stroke="hsl(var(--chart-1))" 
                                        strokeWidth={2}
                                        dot={{ fill: 'hsl(var(--chart-1))', r: 3 }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="posts" 
                                        stroke="hsl(var(--chart-2))" 
                                        strokeWidth={2}
                                        dot={{ fill: 'hsl(var(--chart-2))', r: 3 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-4 justify-center">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <span className="text-sm text-muted-foreground">Total Content</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-chart-1" />
                                <span className="text-sm text-muted-foreground">Pages</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-chart-2" />
                                <span className="text-sm text-muted-foreground">Posts</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Enhanced Recent Activity */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription>
                                Your recently updated pages and posts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentItems.length > 0 ? (
                                <div className="space-y-3">
                                    {recentItems.map((item, index) => (
                                        <div key={item.id} className="group relative">
                                            {/* Timeline line */}
                                            {index < recentItems.length - 1 && (
                                                <div className="absolute left-6 top-12 w-0.5 h-8 bg-border" />
                                            )}
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-muted rounded-full ring-4 ring-background relative z-10">
                                                    {item.type === 'page' ? (
                                                        <FileText className="h-4 w-4 text-blue-600" />
                                                    ) : (
                                                        <Blog className="h-4 w-4 text-green-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                                            {item.title}
                                                        </p>
                                                        <Badge 
                                                            variant={item.status === 'published' ? 'default' : 'secondary'} 
                                                            className="text-xs ml-2 shrink-0"
                                                        >
                                                            {item.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mb-2">
                                                        {item.updatedAt?.toDate ? format(item.updatedAt.toDate(), 'MMM d, yyyy • h:mm a') : 'Unknown date'}
                                                    </p>
                                                    <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
                                                        <Link href={item.url} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Edit className="h-3 w-3 mr-1" />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-muted-foreground">No recent activity</p>
                                    <p className="text-sm text-muted-foreground mt-1">Start creating content to see it here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Performance Overview
                            </CardTitle>
                            <CardDescription>
                                Key metrics and insights about your content
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <div className="text-2xl font-bold text-primary">
                                            {stats?.publishedContent || 0}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">Published</p>
                                    </div>
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {stats?.draftContent || 0}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">In Draft</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                        <span className="text-sm font-medium">Total Content</span>
                                        <span className="font-bold text-lg">{stats?.totalContent || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                        <span className="text-sm font-medium">Growth Rate</span>
                                        <div className="flex items-center gap-1">
                                            <ArrowUp className="h-4 w-4 text-green-600" />
                                            <span className="font-bold text-lg text-green-600">{stats?.growthTrend}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                        <span className="text-sm font-medium">Engagement</span>
                                        <div className="flex items-center gap-2">
                                            <Progress value={stats?.engagementRate || 0} className="w-16 h-2" />
                                            <span className="font-bold text-lg">{stats?.engagementRate}%</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t">
                                    <Button asChild className="w-full group">
                                        <Link href="/analytics">
                                            <BarChart3 className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                                            View Detailed Analytics
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
