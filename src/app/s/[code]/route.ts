import { notFound } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { doc, runTransaction } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server';
import type { ShortLinkPublic } from '@/lib/types';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  // NOTE: In Next.js 15, `params` is a thenable. Avoid destructuring.
  const code = await params.code;
  if (!code) {
    notFound();
  }

  try {
    const publicLinkRef = doc(serverFirestore, 'short_link_public', code);
    const privateLinkRef = doc(serverFirestore, 'short_links', code);

    const originalUrl = await runTransaction(serverFirestore, async (transaction) => {
      // 1. All reads must happen before all writes.
      const publicSnap = await transaction.get(publicLinkRef);
      
      if (!publicSnap.exists()) {
        return null; // Signals not found, will be caught and handled.
      }

      const privateSnap = await transaction.get(privateLinkRef);
      
      const linkData = publicSnap.data() as ShortLinkPublic;
      const currentClicks = linkData.clickCount || 0;

      // 2. Now, perform all writes.
      transaction.update(publicLinkRef, { clickCount: currentClicks + 1 });
      
      if (privateSnap.exists()) {
        transaction.update(privateLinkRef, { clickCount: currentClicks + 1 });
      }

      return linkData.originalUrl;
    });

    if (!originalUrl) {
      notFound();
    }
    
    return NextResponse.redirect(originalUrl, 307);

  } catch (error) {
    console.error('Error handling short link redirect:', { code, error });
    // On failure, redirect to a generic error page or home page.
    const homeUrl = new URL('/', request.nextUrl);
    return NextResponse.redirect(homeUrl, 307);
  }
}
