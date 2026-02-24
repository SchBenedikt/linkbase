import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { doc, getDoc, collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server';
import type { Page as PageType, Link as LinkType, SlugLookup } from '@/lib/types';
import PublicPageComponent from './public-page';

export async function generateStaticParams() {
  try {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      console.warn("Firebase config not found. Returning fallback params.");
      return [{ slug: '_placeholder' }];
    }
    const pagesQuery = query(collection(serverFirestore, 'pages'), where('status', '==', 'published'));
    const pagesSnap = await getDocs(pagesQuery);
    const params = pagesSnap.docs.map(doc => {
        const data = doc.data();
        return { slug: data.slug };
    });
    return params.length > 0 ? params : [{ slug: '_placeholder' }];
  } catch (error) {
    console.error('Error generating static params for [slug]:', error);
    return [{ slug: '_placeholder' }];
  }
}

type Props = {
  params: { slug: string }
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Guard clause for build environments without Firebase credentials.
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    console.warn(`Firebase config not found. Skipping metadata generation for /${params.slug}.`);
    return {
      title: 'Linkbase Page',
    };
  }

  try {
    const { slug } = params;
    const slugRef = doc(serverFirestore, 'slug_lookups', slug);
    const slugSnap = await getDoc(slugRef);

    if (!slugSnap.exists()) {
      return {
        title: 'Page Not Found',
        description: 'The page you are looking for does not exist.',
      };
    }

    const { pageId } = slugSnap.data() as SlugLookup;
    const pageRef = doc(serverFirestore, 'pages', pageId);
    const pageSnap = await getDoc(pageRef);

    if (!pageSnap.exists() || pageSnap.data().status !== 'published') {
       return {
        title: 'Page Not Found',
        description: 'The page you are looking for does not exist.',
      };
    }

    const page = pageSnap.data() as PageType;
    const displayName = [page.firstName, page.lastName].filter(Boolean).join(' ');
    const publicUrl = `${siteUrl}/${slug}`;

    const metadata: Metadata = {
        title: displayName,
        description: page.bio,
        alternates: {
          canonical: publicUrl,
        },
        openGraph: {
            title: displayName,
            description: page.bio,
            url: publicUrl,
            images: page.avatarUrl ? [
            {
                url: page.avatarUrl,
                width: 200,
                height: 200,
            },
            ] : [],
        },
        twitter: {
            card: 'summary',
            title: displayName,
            description: page.bio,
            images: page.avatarUrl ? [page.avatarUrl] : [],
        },
    }
    return metadata;

  } catch (error) {
    console.error('Error generating metadata for page:', error);
    return {
      title: 'Error',
      description: 'Could not load page information.',
    };
  }
}

export default async function Page({ params }: Props) {
    const { slug } = params;
    
    try {
        const slugRef = doc(serverFirestore, 'slug_lookups', slug);
        const slugSnap = await getDoc(slugRef);

        if (!slugSnap.exists()) {
            notFound();
        }

        const { pageId } = slugSnap.data() as SlugLookup;
        const pageRef = doc(serverFirestore, 'pages', pageId);
        const linksQuery = query(collection(serverFirestore, 'pages', pageId, 'links'), orderBy('orderIndex'));

        const [pageSnap, linksSnap] = await Promise.all([
            getDoc(pageRef),
            getDocs(linksQuery)
        ]);

        if (!pageSnap.exists() || pageSnap.data().status !== 'published') {
            notFound();
        }

        const rawPageData = pageSnap.data();
        const pageData = { 
            id: pageSnap.id, 
            ...rawPageData,
            createdAt: rawPageData.createdAt?.toDate ? rawPageData.createdAt.toDate().toISOString() : null,
            updatedAt: rawPageData.updatedAt?.toDate ? rawPageData.updatedAt.toDate().toISOString() : null,
        } as PageType;

        const linksData = linksSnap.docs.map(d => {
            const rawLinkData = d.data();
            return { 
                id: d.id,
                ...rawLinkData,
                createdAt: rawLinkData.createdAt?.toDate ? rawLinkData.createdAt.toDate().toISOString() : null,
                updatedAt: rawLinkData.updatedAt?.toDate ? rawLinkData.updatedAt.toDate().toISOString() : null,
            } as LinkType
        });
        
        const publicUrl = `${siteUrl}/${slug}`;
        
        return <PublicPageComponent page={pageData} links={linksData} publicUrl={publicUrl} />;
    } catch(error) {
        console.error("Error fetching public page data", error);
        notFound();
    }
}
