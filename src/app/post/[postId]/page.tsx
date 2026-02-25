'use client';

import { useEffect, useState, use } from 'react';
import { useParams, notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Post as PostType } from '@/lib/types';
import PublicPostPageComponent from './public-post-page';
import { ClientOnly } from '@/components/client-only';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{ postId: string }>
}

function PostContent({ postId }: { postId: string }) {
  const firestore = useFirestore();
  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore || !postId || postId === '_placeholder') {
      setLoading(false);
      return;
    }

    const fetchPostData = async () => {
      try {
        setLoading(true);
        setError(null);

        const postRef = doc(firestore, 'posts', postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
          notFound();
          return;
        }

        const postData = postSnap.data() as PostType;
        setPost(postData);

      } catch (error) {
        console.error('Error fetching post data:', error);
        setError('Failed to load post. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [firestore, postId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_60%)] text-foreground">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading post...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--destructive)/0.12),transparent_60%)] text-foreground">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Error</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--destructive)/0.12),transparent_60%)] text-foreground">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Post Not Found</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">The post you are looking for does not exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <PublicPostPageComponent post={post} authorName={post.authorName || ''} publicUrl={typeof window !== 'undefined' ? window.location.origin : ''} />;
}

export default function Page({ params }: Props) {
  const resolvedParams = use(params);
  
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_60%)] text-foreground">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <PostContent postId={resolvedParams.postId} />
    </ClientOnly>
  );
}
