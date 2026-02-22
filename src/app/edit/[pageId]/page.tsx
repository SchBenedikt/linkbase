import EditPageClient from './edit-page-client';
import { collection, getDocs } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server';

export async function generateStaticParams() {
  try {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      console.warn('Firebase config not found. Returning fallback params for edit/[pageId].');
      return [{ pageId: 'new' }];
    }
    const pagesSnap = await getDocs(collection(serverFirestore, 'pages'));
    const params = pagesSnap.docs.map(doc => ({ pageId: doc.id }));
    return params.length > 0 ? params : [{ pageId: 'new' }];
  } catch (error) {
    console.error('Error generating static params for edit/[pageId]:', error);
    return [{ pageId: 'new' }];
  }
}

export default function Page() {
  return <EditPageClient />;
}
