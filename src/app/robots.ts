import { MetadataRoute } from 'next'
 
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/edit/',
        '/blog/edit/',
      ],
    },
    sitemap: siteUrl ? `${siteUrl}/sitemap.xml` : undefined,
    host: siteUrl || undefined,
  }
}
