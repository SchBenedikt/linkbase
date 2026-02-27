'use client';

import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  FileText, 
  FileText as Blog, 
  Link2, 
  BarChart3, 
  Clock,
  MousePointerClick,
} from 'lucide-react';
import Link from 'next/link';
import type { Page, Post, ShortLink } from '@/lib/types';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { DashboardNav } from '@/components/dashboard-nav';
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

    // Short links data for real click tracking
    const linksQuery = useMemoFirebase(() =>
        user && firestore ? query(collection(firestore!, 'shortLinks'), where('ownerId', '==', user.uid)) : null,
        [user, firestore]
    );
    const { data: shortLinks, isLoading: areLinksLoading } = useCollection<ShortLink>(linksQuery);

    const stats = useMemo(() => {
        const publishedPages = pages?.filter(p => p.status === 'published').length || 0;
        const publishedPosts = posts?.filter(p => p.status === 'published').length || 0;
        const totalClicks = shortLinks?.reduce((sum, l) => {
            const c = typeof l.clickCount === 'number' ? l.clickCount : parseInt(l.clickCount || '0');
            return sum + c;
        }, 0) || 0;
        return {
            totalPages: pages?.length || 0,
            publishedPages,
            totalPosts: posts?.length || 0,
            publishedPosts,
            totalLinks: shortLinks?.length || 0,
            totalClicks,
        };
    }, [pages, posts, shortLinks]);

    // Recent items sorted by updatedAt
    const recentItems = useMemo(() => {
        const items: Array<{type: 'page' | 'post', title: string, updatedAt: any, url: string, status: string, id: string}> = [];
        pages?.forEach(page => items.push({
            type: 'page',
            title: page.title || 'Untitled Page',
            updatedAt: page.updatedAt,
            url: `/edit/${page.id}`,
            status: page.status,
            id: page.id,
        }));
        posts?.forEach(post => items.push({
            type: 'post',
            title: post.title || 'Untitled Post',
            updatedAt: post.updatedAt,
            url: `/blog/edit/${post.id}`,
            status: post.status,
            id: post.id,
        }));
        return items
            .sort((a, b) => {
                const dateA = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
                const dateB = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
                return dateB - dateA;
            })
            .slice(0, 5);
    }, [pages, posts]);

    if (isUserLoading || arePagesLoading || arePostsLoading || areLinksLoading) {
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
                    <Skeleton className="h-10 w-48 mb-8" />
                    <div className="grid gap-4 md:grid-cols-4 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <Card key={i}>
                                <CardHeader className="pb-2"><Skeleton className="h-4 w-20" /></CardHeader>
                                <CardContent><Skeleton className="h-8 w-16" /></CardContent>
                            </Card>
                        ))}
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
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground mt-1">
                            Welcome back{user?.displayName ? `, ${user.displayName}` : ''}!
                        </p>
                    </div>
                    <Badge variant="secondary" className="text-xs w-fit">
                        {format(new Date(), 'MMMM d, yyyy')}
                    </Badge>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pages</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPages}</div>
                            <p className="text-xs text-muted-foreground">{stats.publishedPages} published</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
                            <Blog className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPosts}</div>
                            <p className="text-xs text-muted-foreground">{stats.publishedPosts} published</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Short Links</CardTitle>
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalLinks}</div>
                            <p className="text-xs text-muted-foreground">active links</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">across all links</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h2>
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

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Clock className="h-4 w-4" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentItems.length > 0 ? (
                            <div className="space-y-2">
                                {recentItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-muted rounded-full">
                                                {item.type === 'page' ? (
                                                    <FileText className="h-4 w-4 text-primary" />
                                                ) : (
                                                    <Blog className="h-4 w-4 text-secondary-foreground" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{item.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.updatedAt?.toDate ? format(item.updatedAt.toDate(), 'MMM d, yyyy') : '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={item.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                                            {item.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-muted-foreground text-sm">No recent activity</p>
                                <p className="text-xs text-muted-foreground mt-1">Create your first page or post to get started.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
