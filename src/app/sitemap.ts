import { MetadataRoute } from 'next'
import { collection, getDocs, query, where } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server';
import type { Page, Post } from '@/lib/types';
 
export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://links.xn--schchner-2za.de';

  const routes = ['', '/features', '/pricing', '/contact', '/login'].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  // Guard clause to prevent build errors if Firebase ENV vars are not set.
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    console.warn("Firebase environment variables not set. Generating a static sitemap only.");
    return routes;
  }

  try {
    const pagesQuery = query(collection(serverFirestore, 'pages'), where('status', '==', 'published'));
    const pagesSnap = await getDocs(pagesQuery);
    const pageUrls = pagesSnap.docs.map(doc => {
        const data = doc.data();
        return {
            url: `${siteUrl}/${data.slug}`,
            lastModified: data.updatedAt?.toDate() || new Date(),
        }
    });

    const postsQuery = query(collection(serverFirestore, 'posts'), where('status', '==', 'published'));
    const postsSnap = await getDocs(postsQuery);
    const postUrls = postsSnap.docs.map(doc => {
        const data = doc.data();
        return {
            url: `${siteUrl}/post/${doc.id}`,
            lastModified: data.updatedAt?.toDate() || new Date(),
        }
    });

    return [
      ...routes,
      ...pageUrls,
      ...postUrls,
    ]
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return routes;
  }
}
