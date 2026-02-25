'use client';

import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import type { Page } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BarChart2, Eye } from 'lucide-react';
import { DashboardNav } from '@/components/dashboard-nav';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

export default function AnalyticsOverviewPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const pagesQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'pages'), where('ownerId', '==', user.uid)) : null),
    [user, firestore]
  );
  const { data: pages, isLoading: arePagesLoading } = useCollection<Page>(pagesQuery);

  const sortedPages = useMemo(() => {
    if (!pages) return [];
    return [...pages].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }, [pages]);

  const isLoading = isUserLoading || arePagesLoading;

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
          <BarChart2 className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        </div>
        <p className="text-muted-foreground mb-8">Select a page to view its analytics.</p>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
          </div>
        ) : sortedPages.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No pages yet</h3>
            <p className="text-muted-foreground mt-2">Create a page first to see its analytics.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedPages.map((page) => {
              const displayName = [page.firstName, page.lastName].filter(Boolean).join(' ') || page.title || 'Untitled Page';
              return (
                <Link key={page.id} href={`/analytics/${page.id}`} className="block group">
                  <Card className="h-full transition-shadow group-hover:shadow-md cursor-pointer border">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg font-semibold leading-tight">{displayName}</CardTitle>
                        <Badge variant={page.status === 'published' ? 'default' : 'secondary'} className="capitalize flex-shrink-0 text-xs">
                          {page.status}
                        </Badge>
                      </div>
                      {page.slug && (
                        <CardDescription className="flex items-center gap-1 text-xs mt-1">
                          <Eye className="h-3 w-3" />
                          /{page.slug}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-primary font-medium flex items-center gap-1.5 group-hover:underline">
                        <BarChart2 className="h-4 w-4" />
                        View Analytics
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
