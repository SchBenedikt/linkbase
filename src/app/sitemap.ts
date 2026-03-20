import { MetadataRoute } from 'next'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server';
import type { Page, Post } from '@/lib/types';

export const dynamic = 'force-static'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  // Static routes with proper priorities and change frequencies
  const staticRoutes = [
    { route: '', priority: 1.0, changeFreq: 'daily' as const },
    { route: '/features', priority: 0.9, changeFreq: 'monthly' as const },
    { route: '/pricing', priority: 0.8, changeFreq: 'monthly' as const },
    { route: '/changelog', priority: 0.8, changeFreq: 'weekly' as const },
    { route: '/design', priority: 0.7, changeFreq: 'monthly' as const },
    { route: '/demo', priority: 0.7, changeFreq: 'monthly' as const },
    { route: '/contact', priority: 0.7, changeFreq: 'monthly' as const },
    { route: '/login', priority: 0.6, changeFreq: 'weekly' as const },
    { route: '/blog', priority: 0.9, changeFreq: 'daily' as const },
    { route: '/dashboard', priority: 0.3, changeFreq: 'weekly' as const },
    { route: '/dashboard/links', priority: 0.3, changeFreq: 'weekly' as const },
    { route: '/dashboard/analytics', priority: 0.3, changeFreq: 'weekly' as const },
    { route: '/dashboard/settings', priority: 0.3, changeFreq: 'weekly' as const },
    { route: '/privacy', priority: 0.5, changeFreq: 'yearly' as const },
    { route: '/impressum', priority: 0.5, changeFreq: 'yearly' as const },
    { route: '/cookies', priority: 0.5, changeFreq: 'yearly' as const }
  ].map(({ route, priority, changeFreq }) => ({
    url: siteUrl ? `${siteUrl}${route}` : `/${route}`,
    lastModified: new Date(),
    changeFrequency: changeFreq,
    priority: priority,
  }));

  // Dynamic routes - try to fetch but don't fail if Firebase is unavailable
  let dynamicRoutes: MetadataRoute.Sitemap = [];
  
  try {
    // Check if serverFirestore is available
    if (!serverFirestore) {
      console.warn('Server Firestore not available, returning static sitemap only');
      return staticRoutes;
    }

    // Fetch published user pages
    const pagesQuery = query(
      collection(serverFirestore, 'pages'),
      where('status', '==', 'published'),
      orderBy('updatedAt', 'desc'),
      limit(1000) // Limit to prevent timeouts
    );
    const pagesSnapshot = await getDocs(pagesQuery);
    
    const userPages = pagesSnapshot.docs.map(doc => {
      const page = doc.data() as Page;
      return {
        url: `${siteUrl}/${doc.id}`,
        lastModified: page.updatedAt?.toDate() || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      };
    });

    // Fetch published blog posts
    const postsQuery = query(
      collection(serverFirestore, 'posts'),
      where('status', '==', 'published'),
      orderBy('updatedAt', 'desc'),
      limit(1000) // Limit to prevent timeouts
    );
    const postsSnapshot = await getDocs(postsQuery);
    
    const blogPosts = postsSnapshot.docs.map(doc => {
      const post = doc.data() as Post;
      return {
        url: `${siteUrl}/post/${doc.id}`,
        lastModified: post.updatedAt?.toDate() || new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      };
    });

    dynamicRoutes = [...userPages, ...blogPosts];
  } catch (error) {
    console.warn('Failed to fetch dynamic routes for sitemap:', error);
    // Continue with static routes only if Firebase fails
  }

  return [...staticRoutes, ...dynamicRoutes];
}
