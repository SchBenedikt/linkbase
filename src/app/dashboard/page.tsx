'use client';

import { useState, useMemo } from 'react';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import type { Page, Post } from '@/lib/types';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { DashboardNav } from '@/components/dashboard-nav';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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

    // Calculate stats
    const stats = useMemo(() => {
        if (!pages && !posts) return null;
        
        const publishedPages = pages?.filter(p => p.status === 'published').length || 0;
        const draftPages = pages?.filter(p => p.status === 'draft').length || 0;
        const publishedPosts = posts?.filter(p => p.status === 'published').length || 0;
        const draftPosts = posts?.filter(p => p.status === 'draft').length || 0;
        
        return {
            totalPages: pages?.length || 0,
            publishedPages,
            draftPages,
            totalPosts: posts?.length || 0,
            publishedPosts,
            draftPosts,
        };
    }, [pages, posts]);

    // Get recent items
    const recentItems = useMemo(() => {
        const items: Array<{type: 'page' | 'post', title: string, updatedAt: any, url: string, status: string}> = [];
        
        pages?.forEach(page => {
            items.push({
                type: 'page',
                title: page.title || 'Untitled Page',
                updatedAt: page.updatedAt,
                url: `/edit/${page.id}`,
                status: page.status
            });
        });
        
        posts?.forEach(post => {
            items.push({
                type: 'post',
                title: post.title || 'Untitled Post',
                updatedAt: post.updatedAt,
                url: `/blog/edit/${post.id}`,
                status: post.status
            });
        });
        
        return items
            .sort((a, b) => {
                const dateA = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
                const dateB = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
                return dateB - dateA;
            })
            .slice(0, 5);
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back! Here's an overview of your content.</p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalPages}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.publishedPages} published, {stats.draftPages} drafts
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
                                    {stats.publishedPosts} published, {stats.draftPosts} drafts
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Links</CardTitle>
                                <Link2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">-</div>
                                <p className="text-xs text-muted-foreground">
                                    Analytics coming soon
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">-</div>
                                <p className="text-xs text-muted-foreground">
                                    Analytics coming soon
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/pages')}>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <PlusCircle className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">Create Page</h3>
                                    <p className="text-sm text-muted-foreground">Build a new page</p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/blog')}>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <Blog className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">Write Post</h3>
                                    <p className="text-sm text-muted-foreground">Create blog content</p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-50">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-muted rounded-full">
                                    <Link2 className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">Manage Links</h3>
                                    <p className="text-sm text-muted-foreground">Coming soon</p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-50">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-muted rounded-full">
                                    <BarChart3 className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">View Analytics</h3>
                                    <p className="text-sm text-muted-foreground">Coming soon</p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription>
                                Your recently updated pages and posts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentItems.length > 0 ? (
                                <div className="space-y-4">
                                    {recentItems.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-muted rounded-full">
                                                    {item.type === 'page' ? (
                                                        <FileText className="h-4 w-4" />
                                                    ) : (
                                                        <Blog className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium line-clamp-1">{item.title}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.updatedAt?.toDate ? format(item.updatedAt.toDate(), 'MMM d, yyyy') : 'Unknown date'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={item.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                                                    {item.status}
                                                </Badge>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={item.url}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No recent activity</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Quick Stats
                            </CardTitle>
                            <CardDescription>
                                Overview of your content performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Published Content</span>
                                    <span className="font-medium">
                                        {(stats?.publishedPages || 0) + (stats?.publishedPosts || 0)} items
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Draft Content</span>
                                    <span className="font-medium">
                                        {(stats?.draftPages || 0) + (stats?.draftPosts || 0)} items
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total Content</span>
                                    <span className="font-medium">
                                        {(stats?.totalPages || 0) + (stats?.totalPosts || 0)} items
                                    </span>
                                </div>
                                <div className="pt-4 border-t">
                                    <Button variant="outline" className="w-full" disabled>
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        View Detailed Analytics (Coming Soon)
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
