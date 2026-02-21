import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server';
import type { Post as PostType } from '@/lib/types';
import PublicPostPageComponent from './public-post-page';

type Props = {
    params: { postId: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const { postId } = params;
        const postRef = doc(serverFirestore, 'posts', postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists() || postSnap.data().status !== 'published') {
            return {
                title: 'Post Not Found',
                description: 'The post you are looking for does not exist or is not published.',
            };
        }

        const post = postSnap.data() as PostType;
        const excerpt = post.content.substring(0, 155);

        return {
            title: post.title,
            description: excerpt,
            openGraph: {
                title: post.title,
                description: excerpt,
                type: 'article',
                publishedTime: post.createdAt.toDate().toISOString(),
                authors: ['BioBloom User'], // This could be enhanced to fetch author name
            },
            twitter: {
                card: 'summary',
                title: post.title,
                description: excerpt,
            },
        }

    } catch (error) {
        console.error('Error generating metadata for post:', error);
        return {
            title: 'Error',
            description: 'Could not load post information.',
        };
    }
}

export default async function Page({ params }: Props) {
    const { postId } = params;

    try {
        const postRef = doc(serverFirestore, 'posts', postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists() || postSnap.data().status !== 'published') {
            notFound();
        }

        const postDataRaw = postSnap.data() as PostType;
        
        // Serialize Firestore Timestamps to strings to pass to client component
        const postData = {
            ...postDataRaw,
            id: postSnap.id,
            createdAt: postDataRaw.createdAt.toDate().toISOString(),
            updatedAt: postDataRaw.updatedAt.toDate().toISOString(),
        }

        return <PublicPostPageComponent post={postData as any} />;

    } catch (error) {
        console.error("Error fetching public post data", error);
        notFound();
    }
}
