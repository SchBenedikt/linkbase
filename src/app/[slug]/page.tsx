'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
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
  const [page, setPage] = useState<PageType | null>(null);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firestore, setFirestore] = useState<any>(null);

  useEffect(() => {
    // Initialize Firebase on client side
    const initializeFirebaseAndFetch = async () => {
      try {
        if (!slug) {
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        // Dynamically import and initialize Firebase to avoid SSR issues
        const { initializeFirebase } = await import('@/firebase');
        const firebaseServices = initializeFirebase();
        
        if (!firebaseServices.firestore) {
          throw new Error('Failed to initialize Firestore');
        }

        setFirestore(firebaseServices.firestore);

        const resolvePageFromSlug = async (firestoreInstance: any) => {
          try {
            const { doc, getDoc } = await import('firebase/firestore');
            const slugRef = doc(firestoreInstance, 'slug_lookups', slug);
            const slugSnap = await getDoc(slugRef);

            if (!slugSnap.exists()) {
              return null;
            }

            const slugData = slugSnap.data() as SlugLookup;
            const pageRef = doc(firestoreInstance, 'pages', slugData.pageId);
            const pageSnap = await getDoc(pageRef);
            return pageSnap.exists() ? pageSnap : null;
          } catch (err) {
            console.error('Slug lookup failed, falling back to pages query:', err);
            const { collection, query, orderBy, where, getDocs, limit } = await import('firebase/firestore');
            const fallbackQuery = query(
              collection(firestoreInstance, 'pages'),
              where('slug', '==', slug),
              limit(1)
            );
            const fallbackSnap = await getDocs(fallbackQuery);
            return fallbackSnap.docs[0] ?? null;
          }
        };

        const pageSnap = await resolvePageFromSlug(firebaseServices.firestore);

        if (!pageSnap || !pageSnap.exists()) {
          notFound();
          return;
        }

        const pageData = { id: pageSnap.id, ...pageSnap.data() } as PageType;
        setPage(pageData);

        // Get links from subcollection
        const { collection, query, orderBy, getDocs } = await import('firebase/firestore');
        const linksQuery = query(
          collection(firebaseServices.firestore, 'pages', pageSnap.id, 'links'),
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

    initializeFirebaseAndFetch();
  }, [slug]);

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
  const resolvedParams = useParams();
  const slug = resolvedParams.slug as string;
  
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
      <PageContent slug={slug} />
    </ClientOnly>
  );
}
