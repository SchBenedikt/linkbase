'use client';

import { useMemo } from 'react';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ExternalLink, Link2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ShortLink, Page } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface TrendingLinkProps {
  rank: number;
  link: ShortLink;
  siteUrl: string;
}

function TrendingLinkRow({ rank, link, siteUrl }: TrendingLinkProps) {
  const shortUrl = `${siteUrl}/s/${link.code}`;
  const barWidth = `${Math.min(100, link.clickCount)}%`;

  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-0">
      <span className="text-2xl font-bold text-muted-foreground w-8 text-center flex-shrink-0">
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate text-sm">{link.title || link.code}</p>
        <a
          href={shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary transition-colors truncate block"
        >
          {shortUrl}
        </a>
        <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: barWidth }}
          />
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-lg">{(link.clickCount || 0).toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">clicks</p>
      </div>
    </div>
  );
}

export default function TrendingPage() {
  const firestore = useFirestore();

  // Load short links sorted by clickCount (all users, top 20)
  const trendingQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'shortLinks'),
            where('isActive', '!=', false),
            orderBy('isActive'),
            orderBy('clickCount', 'desc'),
            limit(20),
          )
        : null,
    [firestore],
  );

  const { data: links, isLoading } = useCollection<ShortLink>(trendingQuery);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // Filter out links with 0 clicks
  const activeLinks = useMemo(
    () => (links || []).filter((l) => (l.clickCount || 0) > 0),
    [links],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Linkbase Trending
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/login">Get started free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3">Live stats</Badge>
            <h1 className="text-4xl font-bold tracking-tight mb-3">Trending Links</h1>
            <p className="text-muted-foreground text-lg">
              The most-clicked short links shared on Linkbase, updated in real time.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Top Links
              </CardTitle>
              <CardDescription>Ranked by total click count</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              ) : activeLinks.length === 0 ? (
                <div className="py-12 text-center">
                  <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No trending links yet. Be the first to share!</p>
                  <Button asChild className="mt-4" size="sm">
                    <Link href="/links">
                      Create a short link <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div>
                  {activeLinks.map((link, idx) => (
                    <TrendingLinkRow
                      key={link.id}
                      rank={idx + 1}
                      link={link}
                      siteUrl={siteUrl}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Want to appear here?{' '}
            <Link href="/links" className="text-primary hover:underline">
              Create your free short link
            </Link>{' '}
            on Linkbase.
          </p>
        </div>
      </main>
    </div>
  );
}
