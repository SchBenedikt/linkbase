import type { Metadata } from 'next';
import { serverFirestore } from '@/firebase/server';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import type { Page as PageType, SlugLookup } from '@/lib/types';
import SlugClientPage from './page-client-content';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

async function fetchPageBySlug(slug: string): Promise<PageType | null> {
  if (!serverFirestore) return null;
  try {
    // Try slug_lookups first (fast path)
    const slugSnap = await getDoc(doc(serverFirestore, 'slug_lookups', slug));
    if (slugSnap.exists()) {
      const { pageId } = slugSnap.data() as SlugLookup;
      const pageSnap = await getDoc(doc(serverFirestore, 'pages', pageId));
      if (pageSnap.exists()) {
        return { id: pageSnap.id, ...pageSnap.data() } as PageType;
      }
    }
    // Fallback: query pages by slug field
    const q = query(
      collection(serverFirestore, 'pages'),
      where('slug', '==', slug),
      limit(1),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as PageType;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const page = await fetchPageBySlug(slug);

  if (!page) {
    return {
      title: 'Profile Not Found | Linkbase',
      robots: { index: false },
    };
  }

  const name = [page.firstName, page.lastName].filter(Boolean).join(' ') || page.title || 'Linkbase Profile';
  const description = page.bio || `Check out ${name}'s link-in-bio page on Linkbase.`;
  const url = `${siteUrl}/${slug}`;
  const image = page.avatarUrl || `${siteUrl}/og-default.png`;

  return {
    title: `${name} | Linkbase`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'profile',
      url,
      title: name,
      description,
      images: [
        {
          url: image,
          width: 400,
          height: 400,
          alt: name,
        },
      ],
      siteName: 'Linkbase',
    },
    twitter: {
      card: 'summary',
      title: name,
      description,
      images: [image],
      site: '@linkbase',
    },
  };
}

export default function Page() {
  return <SlugClientPage />;
}
