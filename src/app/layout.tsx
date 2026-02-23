import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { ClientOnly } from '@/components/client-only';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://links.schächner.de';
const ogImageUrl = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&h=630&fit=crop';


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Linkbase | Your vibrant link-in-bio profile',
    template: '%s | Linkbase',
  },
  description: 'Linkbase is the ultimate platform for creators to build a beautiful, customizable, and powerful link-in-bio page. Share your world, your way.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔗</text></svg>',
  },
  openGraph: {
    title: 'Linkbase | Your vibrant link-in-bio profile',
    description: 'Everything you are, all in one place. Share your creations, your work, and your personality with the world.',
    url: siteUrl,
    siteName: 'Linkbase',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linkbase | Your vibrant link-in-bio profile',
    description: 'Everything you are, all in one place. Share your creations, your work, and your personality with the world.',
    images: [ogImageUrl],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Inter:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Source+Code+Pro:wght@400;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Linkbase",
            "url": siteUrl,
          }) }}
        />
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
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
