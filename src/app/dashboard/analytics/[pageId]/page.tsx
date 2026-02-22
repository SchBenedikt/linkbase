import AnalyticsClient from './analytics-client';
import { collection, getDocs } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server';

export async function generateStaticParams() {
  try {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      console.warn('Firebase config not found. Returning fallback params for analytics/[pageId].');
      return [{ pageId: '_placeholder' }];
    }
    const pagesSnap = await getDocs(collection(serverFirestore, 'pages'));
    const params = pagesSnap.docs.map(doc => ({ pageId: doc.id }));
    return params.length > 0 ? params : [{ pageId: '_placeholder' }];
  } catch (error) {
    console.error('Error generating static params for analytics/[pageId]:', error);
    return [{ pageId: '_placeholder' }];
  }
}

export default function Page() {
  return <AnalyticsClient />;
}
