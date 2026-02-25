'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, doc, getDoc, query, where } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BarChart3, Link2, MousePointer, TrendingUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { ShortLink, Page } from '@/lib/types';
import { DashboardNav } from '@/components/dashboard-nav';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AnalyticsRouter() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [loading, setLoading] = useState(true);
  const [idType, setIdType] = useState<'page' | 'shortlink' | 'notfound'>('notfound');

  // Check if ID is a page
  const pageQuery = useMemoFirebase(
    () => user && firestore ? doc(firestore, 'pages', id) : null,
    [user, firestore, id]
  );

  // Check if ID is a short link
  const shortLinkQuery = useMemoFirebase(
    () => user && firestore ? doc(firestore, 'shortLinks', id) : null,
    [user, firestore, id]
  );

  // We'll use getDoc instead of useCollection to check single documents
  useMemo(() => {
    const checkIdType = async () => {
      if (!user || !firestore || !id) {
        setIdType('notfound');
        setLoading(false);
        return;
      }

      try {
        // Check if it's a page
        const pageDoc = await getDoc(doc(firestore, 'pages', id));
        if (pageDoc.exists() && pageDoc.data()?.ownerId === user.uid) {
          setIdType('page');
          setLoading(false);
          return;
        }

        // Check if it's a short link
        const shortLinkDoc = await getDoc(doc(firestore, 'shortLinks', id));
        if (shortLinkDoc.exists() && shortLinkDoc.data()?.ownerId === user.uid) {
          setIdType('shortlink');
          setLoading(false);
          return;
        }

        setIdType('notfound');
      } catch (error) {
        console.error('Error checking ID type:', error);
        setIdType('notfound');
      }
      setLoading(false);
    };

    checkIdType();
  }, [user, firestore, id]);

  if (isUserLoading || loading) {
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
            <Skeleton className="h-32 rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  if (idType === 'notfound') {
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
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Analytics Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The analytics for "{id}" could not be found or you don't have permission to view it.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/analytics">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Analytics
                </Link>
              </Button>
              <Button asChild>
                <Link href="/analytics/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Page Analytics
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (idType === 'page') {
    // Redirect to existing page analytics
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
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h2 className="text-xl font-semibold mb-2">Redirecting to Page Analytics...</h2>
                <p className="text-muted-foreground mb-4">
                  Taking you to the detailed page analytics for "{id}"
                </p>
                <Button asChild>
                  <Link href={`/analytics/analytics/${id}`}>
                    Go to Page Analytics
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Short link analytics
  return <ShortLinkAnalytics id={id} />;
}

function ShortLinkAnalytics({ id }: { id: string }) {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const shortLinkQuery = useMemoFirebase(
    () => user && firestore ? doc(firestore, 'shortLinks', id) : null,
    [user, firestore, id]
  );

  // We'll fetch the short link data
  const [shortLink, setShortLink] = useState<ShortLink | null>(null);
  const [loading, setLoading] = useState(true);

  useMemo(() => {
    const fetchShortLink = async () => {
      if (!user || !firestore || !id) {
        setLoading(false);
        return;
      }

      try {
        const docSnap = await getDoc(doc(firestore, 'shortLinks', id));
        if (docSnap.exists() && docSnap.data()?.ownerId === user.uid) {
          setShortLink({ id: docSnap.id, ...docSnap.data() } as ShortLink);
        }
      } catch (error) {
        console.error('Error fetching short link:', error);
      }
      setLoading(false);
    };

    fetchShortLink();
  }, [user, firestore, id]);

  if (loading) {
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
          <Skeleton className="h-32 rounded-lg" />
        </main>
      </div>
    );
  }

  if (!shortLink) {
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
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Short Link Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The short link "{id}" could not be found or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link href="/analytics">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Analytics
              </Link>
            </Button>
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
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/analytics">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Analytics
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Short Link Analytics</h1>
        </div>

        {/* Link Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              {shortLink.title || 'Untitled Link'}
            </CardTitle>
            <CardDescription>
              /s/{shortLink.code}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Destination URL</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm truncate">{shortLink.originalUrl}</p>
                  <Button asChild variant="outline" size="sm">
                    <a href={shortLink.originalUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{shortLink.clickCount || 0}</div>
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {shortLink.createdAt?.toDate?.() ? 
                      new Date(shortLink.createdAt.toDate()).toLocaleDateString() : 
                      'Unknown'
                    }
                  </div>
                  <p className="text-sm text-muted-foreground">Created Date</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {shortLink.updatedAt?.toDate?.() ? 
                      new Date(shortLink.updatedAt.toDate()).toLocaleDateString() : 
                      'Unknown'
                    }
                  </div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance
              </CardTitle>
              <CardDescription>
                How this link is performing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Click Count</span>
                  <Badge variant="outline">{shortLink.clickCount || 0} clicks</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={shortLink.clickCount > 0 ? 'default' : 'secondary'}>
                    {shortLink.clickCount > 0 ? 'Active' : 'No clicks yet'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Manage this short link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href={`/links`}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Manage Links
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href={`${typeof window !== 'undefined' ? window.location.origin : ''}/s/${shortLink.code}`} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Test Link
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
