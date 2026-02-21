import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server';
import type { Page as PageType, Link as LinkType, SlugLookup } from '@/lib/types';
import PublicPageComponent from './public-page';

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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

    if (!pageSnap.exists()) {
       return {
        title: 'Page Not Found',
        description: 'The page you are looking for does not exist.',
      };
    }

    const page = pageSnap.data() as PageType;

    const metadata: Metadata = {
        title: page.displayName,
        description: page.bio,
        openGraph: {
            title: page.displayName,
            description: page.bio,
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
            title: page.displayName,
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

        if (!pageSnap.exists()) {
            notFound();
        }

        const pageData = { id: pageSnap.id, ...pageSnap.data() } as PageType;
        const linksData = linksSnap.docs.map(d => ({ id: d.id, ...d.data() } as LinkType));
        
        return <PublicPageComponent page={pageData} links={linksData} />;
    } catch(error) {
        console.error("Error fetching public page data", error);
        notFound();
    }
}
