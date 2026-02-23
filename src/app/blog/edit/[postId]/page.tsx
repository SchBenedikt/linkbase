import PostEditorClient from './post-editor-client';
import { collection, getDocs } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server';

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    if (process.env.NODE_ENV === 'production') {
      return [{ postId: 'new' }];
    }
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      console.warn('Firebase config not found. Returning fallback params for blog/edit/[postId].');
      return [{ postId: 'new' }];
    }
    const postsSnap = await getDocs(collection(serverFirestore, 'posts'));
    const params = postsSnap.docs.map(doc => ({ postId: doc.id }));
    return params.length > 0 ? params : [{ postId: 'new' }];
  } catch (error) {
    console.error('Error generating static params for blog/edit/[postId]:', error);
    return [{ postId: 'new' }];
  }
}

export default function Page() {
  return <PostEditorClient />;
}
