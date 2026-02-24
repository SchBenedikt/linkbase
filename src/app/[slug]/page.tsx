import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { doc, getDoc, collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server';
import type { Page as PageType, Link as LinkType, SlugLookup } from '@/lib/types';
import PublicPageComponent from './public-page';

export async function generateStaticParams() {
  // Return static params only - no Firebase access during build
  return [{ slug: '_placeholder' }];
}

type Props = {
  params: { slug: string }
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Return static metadata - no Firebase access during build
  return {
    title: 'Linkbase Page',
    description: 'A beautiful link-in-bio page created with Linkbase.',
  };
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
