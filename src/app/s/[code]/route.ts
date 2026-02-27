import { notFound } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import type { ShortLinkPublic } from '@/lib/types';
import { adminFirestore } from '@/firebase/admin';

export const dynamic = 'force-dynamic';

// Helper function to increment click count using Admin SDK for private, REST API for public
async function incrementClickCount(projectId: string, apiKey: string, code: string) {
  try {
    // Update private collection (for analytics) using Admin SDK
    if (adminFirestore) {
      console.log(`Short link ${code}: Updating private collection using Admin SDK`);
      try {
        const privateDocRef = adminFirestore.collection('shortLinks').doc(code);
        const privateDoc = await privateDocRef.get();
        
        if (privateDoc.exists) {
          const currentCount = privateDoc.data()?.clickCount || 0;
          console.log(`Short link ${code}: Current private click count: ${currentCount}`);
          
          await privateDocRef.update({
            clickCount: currentCount + 1,
            updatedAt: new Date()
          });
          console.log(`Short link ${code}: Successfully updated private collection`);
        } else {
          console.log(`Short link ${code}: Private collection document not found`);
        }
      } catch (adminError) {
        console.error(`Short link ${code}: Admin SDK update failed:`, adminError);
      }
    } else {
      console.log(`Short link ${code}: Admin Firestore not available, skipping private collection update`);
    }
    
    // Also update public collection
    const publicUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/short_link_public/${code}`;
    const publicGetResponse = await fetch(publicUrl);
    
    if (publicGetResponse.ok) {
      const publicDoc = await publicGetResponse.json();
      const currentPublicCount = publicDoc.fields?.clickCount?.integerValue || '0';
      
      // Use simple PATCH without updateMask for public collection
      console.log(`Short link ${code}: Updating public collection with URL: ${publicUrl}`);
      const publicRequestBody = {
        fields: {
          ...publicDoc.fields, // Preserve existing fields
          clickCount: { integerValue: (parseInt(currentPublicCount) + 1).toString() }
        }
      };
      console.log(`Short link ${code}: Public request body:`, JSON.stringify(publicRequestBody, null, 2));
      
      const publicUpdateResponse = await fetch(publicUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(publicRequestBody)
      });
      
      if (!publicUpdateResponse.ok) {
        console.error('Failed to update public collection:', await publicUpdateResponse.text());
        console.error('Request URL:', publicUrl);
        console.error('Request body:', JSON.stringify({
          fields: {
            clickCount: { integerValue: (parseInt(currentPublicCount) + 1).toString() }
          }
        }));
      } else {
        console.log(`Short link ${code}: Successfully updated public collection`);
      }
    }
    
    console.log(`Short link ${code}: Click tracking completed successfully`);
    
  } catch (error) {
    console.error(`Short link ${code}: Click tracking failed:`, error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  if (!code) {
    console.error('Short link redirect: No code provided');
    notFound();
  }

  console.log('Short link redirect: Processing code:', code);

  try {
    // Use Firebase REST API to avoid code generation issues
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!projectId || !apiKey) {
      console.error('Missing Firebase configuration');
      const homeUrl = new URL('/', request.nextUrl);
      return NextResponse.redirect(homeUrl, 307);
    }
    
    // Special test case for debugging
    if (code === 'test123') {
      console.log('Test link detected, redirecting to Google');
      
      // Track click for test link using REST API
      try {
        await incrementClickCount(projectId, apiKey, code);
        console.log(`Test link: Incremented click count`);
      } catch (error) {
        console.error(`Test link: Failed to update click count:`, error);
      }
      
      return NextResponse.redirect('https://www.google.com', 307);
    }

    console.log('Checking public collection for code:', code);
    
    // First try to get from public collection - use Web API Key for REST API
    const publicUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/short_link_public/${code}`;
    
    const publicResponse = await fetch(publicUrl);
    
    if (publicResponse.ok) {
      const publicData = await publicResponse.json();
      const originalUrl = publicData.fields?.originalUrl?.stringValue;
      
      if (originalUrl) {
        console.log(`Short link ${code}: Found in public collection, redirecting to:`, originalUrl);
        
        // Track click using REST API
        try {
          await incrementClickCount(projectId, apiKey, code);
          console.log(`Short link ${code}: Incremented click count`);
        } catch (error) {
          console.error(`Short link ${code}: Failed to update click count:`, error);
        }
        
        return NextResponse.redirect(originalUrl, 307);
      }
    }

    // Not found in public collection, try private collection
    console.log(`Short link ${code}: Not found in public collection, checking private collection`);
    
    const privateUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/shortLinks/${code}`;
    
    const privateResponse = await fetch(privateUrl);
    
    if (!privateResponse.ok) {
      console.log(`Short link ${code}: Not found in either collection`);
      notFound();
    }
    
    const privateData = await privateResponse.json();
    const originalUrl = privateData.fields?.originalUrl?.stringValue;
    
    if (!originalUrl) {
      console.error(`Short link ${code}: No URL found in private collection`);
      notFound();
    }
    
    console.log(`Short link ${code}: Found in private collection, redirecting to:`, originalUrl);
    
    // Track click using REST API
    try {
      await incrementClickCount(projectId, apiKey, code);
      console.log(`Short link ${code}: Incremented click count`);
    } catch (error) {
      console.error(`Short link ${code}: Failed to update click count:`, error);
    }
    
    return NextResponse.redirect(originalUrl, 307);

  } catch (error) {
    console.error('Error handling short link redirect:', { 
      code, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Check if it's a Firebase configuration error
    if (error instanceof Error && error.message.includes('Firebase configuration is incomplete')) {
      console.error('Firebase server configuration error - check environment variables');
    }
    
    // On any failure, redirect to home page instead of showing 500 error
    const homeUrl = new URL('/', request.nextUrl);
    return NextResponse.redirect(homeUrl, 307);
  }
}
