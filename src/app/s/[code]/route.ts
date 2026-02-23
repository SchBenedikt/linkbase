import { NextResponse, type NextRequest } from 'next/server';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const { code } = params;
  if (!code) {
    notFound();
  }

  try {
    const publicLinkRef = doc(serverFirestore, 'short_link_public', code);
    const privateLinkRef = doc(serverFirestore, 'short_links', code);

    // Use a transaction to safely increment the click count
    const originalUrl = await runTransaction(serverFirestore, async (transaction) => {
      const publicSnap = await transaction.get(publicLinkRef);
      
      if (!publicSnap.exists()) {
        return null; // Link not found
      }

      // Increment public click count
      transaction.update(publicLinkRef, { clickCount: (publicSnap.data().clickCount || 0) + 1 });
      
      // Also try to increment private click count for consistency
      const privateSnap = await transaction.get(privateLinkRef);
      if (privateSnap.exists()) {
          transaction.update(privateLinkRef, { clickCount: (privateSnap.data().clickCount || 0) + 1 });
      }
      
      return publicSnap.data().originalUrl;
    });


    if (originalUrl) {
      // Use a temporary redirect, which is better for tracking clicks
      return NextResponse.redirect(originalUrl, 307);
    } else {
      notFound();
    }

  } catch (error) {
    console.error('Error handling short link redirect:', { code, error });
    // Redirect to home on failure to prevent error pages on the redirect route.
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }
}
