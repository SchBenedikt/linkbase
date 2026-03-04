import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { ClientOnly } from '@/components/client-only';
import JsonLdScript from '@/components/json-ld-script';
import { CookieBanner } from '@/components/cookie-banner';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
const ogImageUrl = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&h=630&fit=crop';

// Performance optimization: Preload critical resources
const preloadResources = [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  { rel: 'dns-prefetch', href: 'https://firebase.googleapis.com' },
  { rel: 'dns-prefetch', href: 'https://www.googleapis.com' },
];

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: 'Linkbase | Free Link-in-Bio & Digital Business Card Platform',
    template: '%s | Linkbase',
  },
  description: 'Create your free link-in-bio page with Linkbase. Share links, write blog posts, track analytics, and build your digital presence. No code required. Free forever.',
  keywords: [
    'link in bio',
    'bio link',
    'digital business card',
    'linktree alternative',
    'free link in bio',
    'personal website',
    'portfolio',
    'social links',
    'url shortener',
    'blog platform',
    'creator tools',
    'online presence',
    'links.schächner.de'
  ],
  authors: [{ name: 'Linkbase Team' }],
  creator: 'Linkbase',
  publisher: 'Linkbase',
  category: 'technology',
  classification: 'Web Application',
  referrer: 'origin-when-cross-origin',
  alternates: {
    canonical: siteUrl,
    languages: {
      'en': siteUrl,
      'de': `${siteUrl}/de`,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Linkbase | Free Link-in-Bio & Digital Business Card Platform',
    description: 'Everything you are, all in one place. Create your free link-in-bio page, share your work, write blog posts, and track your performance.',
    url: siteUrl,
    siteName: 'Linkbase',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Linkbase - Create your free link-in-bio page',
        type: 'image/jpeg',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linkbase | Free Link-in-Bio & Digital Business Card Platform',
    description: 'Create your free link-in-bio page. Share links, write blog posts, track analytics. No code required.',
    images: [ogImageUrl],
    creator: '@linkbase',
    site: '@linkbase',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
  },
  other: {
    'theme-color': '#000000',
    'msapplication-TileColor': '#000000',
    'viewport': 'width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="!scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Performance optimizations */}
        {preloadResources.map((resource, index) => (
          <link 
            key={index}
            rel={resource.rel} 
            href={resource.href} 
            {...(resource.crossOrigin && { crossOrigin: resource.crossOrigin as 'anonymous' | 'use-credentials' | '' })}
          />
        ))}
        
        {/* Font preloading */}
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Inter:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Source+Code+Pro:wght@400;700&display=swap" rel="stylesheet" />
        
        {/* Structured data */}
        <JsonLdScript data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Linkbase",
          "url": siteUrl,
          "description": "Create your free link-in-bio page with Linkbase. Share links, write blog posts, track analytics, and build your digital presence.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${siteUrl}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Linkbase",
            "url": siteUrl,
            "logo": {
              "@type": "ImageObject",
              "url": `${siteUrl}/icon.svg`
            }
          }
        }} />
        
        {/* Performance monitoring */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Performance monitoring for Core Web Vitals
            if ('PerformanceObserver' in window) {
              const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                  if (entry.entryType === 'largest-contentful-paint') {
                    console.log('LCP:', entry.startTime);
                  }
                  if (entry.entryType === 'first-input') {
                    console.log('FID:', entry.processingStart - entry.startTime);
                  }
                  if (entry.entryType === 'layout-shift') {
                    if (!entry.hadRecentInput) {
                      console.log('CLS:', entry.value);
                    }
                  }
                }
              });
              observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
            }
          `
        }} />
      </head>
      <body className="font-body antialiased">
        <ErrorBoundary>
          <ThemeProvider>
            <ClientOnly fallback={<div className="min-h-screen bg-background"></div>}>
              <FirebaseClientProvider>
                <FirebaseErrorListener />
                {children}
              </FirebaseClientProvider>
            </ClientOnly>
            <Toaster />
            <CookieBanner />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
