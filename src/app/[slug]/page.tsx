'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { doc, getDoc, collection, query, orderBy, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Page as PageType, Link as LinkType, SlugLookup } from '@/lib/types';
import PublicPageComponent from './public-page';
import { ClientOnly } from '@/components/client-only';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

type Props = {
  params: { slug: string }
};

function PageContent({ slug }: { slug: string }) {
  const firestore = useFirestore();
  const [page, setPage] = useState<PageType | null>(null);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore || !slug) {
      setLoading(false);
      return;
    }

    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get slug lookup
        const slugRef = doc(firestore, 'slug_lookups', slug);
        const slugSnap = await getDoc(slugRef);

        if (!slugSnap.exists()) {
          notFound();
          return;
        }

        const slugData = slugSnap.data() as SlugLookup;
        const pageRef = doc(firestore, 'pages', slugData.pageId);
        const pageSnap = await getDoc(pageRef);

        if (!pageSnap.exists()) {
          notFound();
          return;
        }

        const pageData = pageSnap.data() as PageType;
        setPage(pageData);

        // Get links
        const linksQuery = query(
          collection(firestore, 'links'),
          where('pageId', '==', pageData.id),
          orderBy('orderIndex', 'asc')
        );
        const linksSnap = await getDocs(linksQuery);
        const linksData = linksSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as LinkType[];
        setLinks(linksData);

      } catch (err) {
        console.error('Error fetching page data:', err);
        setError('Failed to load page. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [firestore, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_60%)] text-foreground">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading page...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--destructive)/0.12),transparent_60%)] text-foreground">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Error</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--destructive)/0.12),transparent_60%)] text-foreground">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Page Not Found</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">The page you are looking for does not exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <PublicPageComponent page={page} links={links} publicUrl={typeof window !== 'undefined' ? window.location.origin : ''} />;
}

export default function Page({ params }: Props) {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_60%)] text-foreground">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <PageContent slug={params.slug} />
    </ClientOnly>
  );
}
