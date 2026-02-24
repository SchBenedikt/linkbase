import { MetadataRoute } from 'next'
import { collection, getDocs, query, where } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server';
import type { Page, Post } from '@/lib/types';

export const dynamic = 'force-static'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  // Return static sitemap only - no Firebase access during build
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
    url: siteUrl ? `${siteUrl}${route}` : `/${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : route === '/blog' ? 0.8 : 0.6,
  }));

  return staticRoutes;
}
