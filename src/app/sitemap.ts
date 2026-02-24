import { MetadataRoute } from 'next'
import { collection, getDocs, query, where } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server';
import type { Page, Post } from '@/lib/types';

export const dynamic = 'force-static'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://links.schächner.de';

  const staticRoutes = [
    '',
    '/features', 
    '/pricing', 
    '/contact', 
    '/login',
    '/blog',
    '/dashboard',
    '/dashboard/links',
    '/dashboard/analytics',
    '/dashboard/settings',
    '/privacy',
    '/impressum',
    '/cookies'
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : route === '/blog' ? 0.8 : 0.6,
  }));

  // Guard clause to prevent build errors if Firebase ENV vars are not set.
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    console.warn("Firebase environment variables not set. Generating a static sitemap only.");
    return staticRoutes;
  }

  try {
    const dynamicRoutes: MetadataRoute.Sitemap = [];

    // Add published pages
    const pagesQuery = query(
      collection(serverFirestore, 'pages'),
      where('status', '==', 'published')
    );
    const pagesSnapshot = await getDocs(pagesQuery);
    
    pagesSnapshot.forEach((doc) => {
      const page = doc.data() as Page;
      dynamicRoutes.push({
        url: `${siteUrl}/${page.slug}`,
        lastModified: page.updatedAt?.toDate() || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      });
    });

    // Add published posts
    const postsQuery = query(
      collection(serverFirestore, 'posts'),
      where('published', '==', true)
    );
    const postsSnapshot = await getDocs(postsQuery);
    
    postsSnapshot.forEach((doc) => {
      const post = doc.data() as Post;
      dynamicRoutes.push({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt?.toDate() || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      });
    });

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    return staticRoutes;
  }
}
