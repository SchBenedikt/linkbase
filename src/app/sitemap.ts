import { MetadataRoute } from 'next'
import { collection, getDocs, query, where } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server';
import type { Page, Post } from '@/lib/types';
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://links.xn--schchner-2za.de';

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

    const routes = ['', '/features', '/pricing', '/contact', '/login'].map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
    }));

    return [
      ...routes,
      ...pageUrls,
      ...postUrls,
    ]
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return [
      {
        url: siteUrl,
        lastModified: new Date(),
      },
    ];
  }
}
