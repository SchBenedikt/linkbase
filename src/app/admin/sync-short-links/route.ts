import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server';

export const dynamic = 'force-dynamic';

// This is an admin endpoint to sync short links between private and public collections
// It should be protected in production with proper authentication
export async function POST(request: NextRequest) {
  try {
    console.log('Starting short links sync process...');
    
    // Get all short links from private collection
    const privateLinksSnapshot = await getDocs(collection(serverFirestore, 'shortLinks'));
    const privateLinks = privateLinksSnapshot.docs;
    
    // Get all short links from public collection
    const publicLinksSnapshot = await getDocs(collection(serverFirestore, 'short_link_public'));
    const publicCodes = new Set(publicLinksSnapshot.docs.map(doc => doc.id));
    
    console.log(`Found ${privateLinks.length} private links, ${publicCodes.size} public links`);
    
    let syncedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    // Process in batches of 500 (Firestore limit)
    const batchSize = 500;
    for (let i = 0; i < privateLinks.length; i += batchSize) {
      const batch = writeBatch(serverFirestore);
      const batchEnd = Math.min(i + batchSize, privateLinks.length);
      
      for (let j = i; j < batchEnd; j++) {
        const privateDoc = privateLinks[j];
        const code = privateDoc.id;
        const privateData = privateDoc.data();
        
        // Skip if already exists in public collection
        if (publicCodes.has(code)) {
          continue;
        }
        
        try {
          const publicRef = doc(serverFirestore, 'short_link_public', code);
          batch.set(publicRef, {
            originalUrl: privateData.originalUrl,
            clickCount: privateData.clickCount || 0
          });
          syncedCount++;
        } catch (error) {
          errorCount++;
          errors.push(`Error processing ${code}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      // Commit the batch
      await batch.commit();
      console.log(`Processed batch ${Math.floor(i/batchSize) + 1}, synced ${syncedCount} links so far`);
    }
    
    const result = {
      success: true,
      message: `Sync completed. Synced ${syncedCount} links to public collection.`,
      stats: {
        totalPrivateLinks: privateLinks.length,
        existingPublicLinks: publicCodes.size,
        syncedLinks: syncedCount,
        errors: errorCount
      },
      errors: errors.length > 0 ? errors : undefined
    };
    
    console.log('Short links sync completed:', result);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error during short links sync:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check sync status
export async function GET() {
  try {
    // Get counts from both collections
    const privateLinksSnapshot = await getDocs(collection(serverFirestore, 'shortLinks'));
    const publicLinksSnapshot = await getDocs(collection(serverFirestore, 'short_link_public'));
    
    const privateCodes = new Set(privateLinksSnapshot.docs.map(doc => doc.id));
    const publicCodes = new Set(publicLinksSnapshot.docs.map(doc => doc.id));
    
    // Find missing links (in private but not in public)
    const missingLinks = [...privateCodes].filter(code => !publicCodes.has(code));
    
    return NextResponse.json({
      privateCount: privateLinksSnapshot.size,
      publicCount: publicLinksSnapshot.size,
      missingCount: missingLinks.length,
      missingLinks: missingLinks.slice(0, 10), // Show first 10 missing links
      needsSync: missingLinks.length > 0
    });
    
  } catch (error) {
    console.error('Error checking sync status:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
