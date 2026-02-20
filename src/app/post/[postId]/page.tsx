'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore, initializeFirebase } from '@/firebase';
import type { Post } from '@/lib/types';
import { format } from 'date-fns';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PostPage() {
    const params = useParams();
    const postId = params.postId as string;
    const { firestore } = initializeFirebase();

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!postId || !firestore) return;

        const fetchPost = async () => {
            setLoading(true);
            try {
                const postRef = doc(firestore, 'posts', postId);
                const postSnap = await getDoc(postRef);

                if (postSnap.exists()) {
                    const postData = { id: postSnap.id, ...postSnap.data() } as Post;
                    
                    // On public post pages, only show published posts.
                    // An owner viewing their own draft would do so in the editor.
                    if (postData.status !== 'published') {
                         setError('This post is not available to view.');
                         setLoading(false);
                         return;
                    }
                    setPost(postData);
                } else {
                    setError('Sorry, this post could not be found.');
                }
            } catch (e) {
                console.error(e);
                setError('Failed to load the post.');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId, firestore]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                <h1 className="text-2xl font-bold mb-4">{error}</h1>
                 <Button asChild>
                    <Link href="/">Go back home</Link>
                </Button>
            </div>
        )
    }

    if (!post) {
        return null; // Should be covered by error state
    }

    return (
        <div className="bg-background min-h-screen">
             <header className="py-4 border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/blog">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Blog
                        </Link>
                    </Button>
                     <Button variant="link" asChild className="font-headline font-bold text-xl text-primary">
                        <Link href="/">
                           BioBloom*
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <article className="max-w-4xl mx-auto">
                    <header className="mb-8 text-center border-b pb-8">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-foreground">
                            {post.title}
                        </h1>
                        <p className="text-muted-foreground text-base">
                            <span>{post.createdAt?.toDate ? format(post.createdAt.toDate(), 'PPP') : ''}</span>
                        </p>
                    </header>
                    <div className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">
                       {post.content}
                    </div>
                </article>
            </main>
        </div>
    );
}
