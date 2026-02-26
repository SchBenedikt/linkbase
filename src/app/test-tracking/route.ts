import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Test endpoint to verify click tracking is working
export async function GET(request: NextRequest) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!projectId || !apiKey) {
      return NextResponse.json({ error: 'Missing Firebase configuration' }, { status: 500 });
    }
    
    // Test tracking a click for test123
    const testCode = 'test123';
    
    // Get current click count
    const getUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/shortLinks/${testCode}`;
    const getResponse = await fetch(getUrl);
    
    if (getResponse.ok) {
      const doc = await getResponse.json();
      const currentCount = doc.fields?.clickCount?.integerValue || '0';
      
      // Increment click count with properly encoded updateMask
      const updateUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/shortLinks/${testCode}?updateMask=clickCount%2CupdatedAt`;
      
      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            clickCount: { integerValue: (parseInt(currentCount) + 1).toString() },
            updatedAt: { timestampValue: new Date().toISOString() }
          }
        })
      });
      
      if (updateResponse.ok) {
        return NextResponse.json({
          success: true,
          message: 'Click tracking test successful',
          previousCount: parseInt(currentCount),
          newCount: parseInt(currentCount) + 1,
          testUrl: `https://your-domain.com/s/${testCode}`,
          note: 'Fixed REST API implementation'
        });
      } else {
        const errorText = await updateResponse.text();
        return NextResponse.json({ 
          error: 'Failed to update click count', 
          details: errorText 
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({ 
        error: 'Test link not found', 
        message: 'Make sure test123 short link exists' 
      }, { status: 404 });
    }
    
  } catch (error) {
    console.error('Test tracking error:', error);
    return NextResponse.json({ 
      error: 'Test tracking failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
