import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server';
import type { Post as PostType } from '@/lib/types';
import PublicPostPageComponent from './public-post-page';

type Props = {
    params: { postId: string }
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://biobloom.co';

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
        const excerpt = post.content.substring(0, 155).replace(/\s+/g, ' ').trim() + '...';
        const publicUrl = `${siteUrl}/post/${postId}`;

        // Fetch author's name
        let authorName = 'BioBloom User';
        if (post.ownerId) {
            const pagesQuery = query(collection(serverFirestore, 'pages'), where('ownerId', '==', post.ownerId), limit(1));
            const pagesSnap = await getDocs(pagesQuery);
            if (!pagesSnap.empty) {
                authorName = pagesSnap.docs[0].data().displayName;
            }
        }

        return {
            title: post.title,
            description: excerpt,
            alternates: {
              canonical: publicUrl,
            },
            openGraph: {
                title: post.title,
                description: excerpt,
                url: publicUrl,
                type: 'article',
                publishedTime: post.createdAt.toDate().toISOString(),
                authors: [authorName],
            },
            twitter: {
                card: 'summary_large_image',
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

        // Fetch author's name
        let authorName = 'BioBloom User';
        if (postDataRaw.ownerId) {
            const pagesQuery = query(collection(serverFirestore, 'pages'), where('ownerId', '==', postDataRaw.ownerId), limit(1));
            const pagesSnap = await getDocs(pagesQuery);
            if (!pagesSnap.empty) {
                authorName = pagesSnap.docs[0].data().displayName;
            }
        }
        
        // Serialize Firestore Timestamps to strings to pass to client component
        const postData = {
            ...postDataRaw,
            id: postSnap.id,
            createdAt: postDataRaw.createdAt.toDate().toISOString(),
            updatedAt: postDataRaw.updatedAt.toDate().toISOString(),
        }

        return <PublicPostPageComponent post={postData as any} authorName={authorName} />;

    } catch (error) {
        console.error("Error fetching public post data", error);
        notFound();
    }
}
