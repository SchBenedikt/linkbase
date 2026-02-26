'use client';

import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Post } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function PostCard({ post }: { post: Post }) {
    const router = useRouter();
    const publicationDate = post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMM d, yyyy') : '...';
    const excerpt = post.excerpt || (post.content ? post.content.substring(0, 150).replace(/\s+/g, ' ').trim() + (post.content.length > 150 ? '…' : '') : '');

    const handleAuthorClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (post.authorPageSlug) {
            router.push(`/${post.authorPageSlug}`);
        }
    };

    return (
        <Link href={`/post/${post.id}`} className="group block">
            <article className="flex flex-col h-full rounded-xl border bg-card overflow-hidden transition-all duration-300">
                {post.coverImage ? (
                    <div className="aspect-video overflow-hidden bg-muted">
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                ) : (
                    <div className="aspect-video bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
                        <span className="text-4xl font-bold text-muted-foreground/30 select-none">
                            {post.title?.charAt(0)?.toUpperCase()}
                        </span>
                    </div>
                )}
                <div className="flex flex-col flex-1 p-5">
                    {post.categories && post.categories.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1">
                            {post.categories.slice(0, 3).map((category, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">{category}</Badge>
                            ))}
                            {post.categories.length > 3 && (
                                <Badge variant="secondary" className="text-xs">+{post.categories.length - 3}</Badge>
                            )}
                        </div>
                    )}
                    <h2 className="font-bold text-lg leading-snug mb-2 text-card-foreground group-hover:underline line-clamp-2">
                        {post.title}
                    </h2>
                    {excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3 flex-1 mb-4">
                            {excerpt}
                        </p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-2">
                        <button
                            onClick={handleAuthorClick}
                            className="flex items-center gap-2 hover:underline"
                        >
                            <Avatar className="h-7 w-7">
                                <AvatarImage src={post.authorAvatarUrl} />
                                <AvatarFallback className="text-xs">{post.authorName?.charAt(0) || 'A'}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium text-muted-foreground">{post.authorName}</span>
                        </button>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{publicationDate}</span>
                            {post.readingTime && (
                                <>
                                    <span>·</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {post.readingTime}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}

function PostCardSkeleton() {
    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-5 space-y-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
        </div>
    );
}

export default function PublicBlogPage() {
    const firestore = useFirestore();

    const publicPostsQuery = useMemoFirebase(() =>
        firestore ? query(collection(firestore, 'posts'), where('status', '==', 'published')) : null,
        [firestore]
    );

    const { data: unsortedPosts, isLoading } = useCollection<Post>(publicPostsQuery);

    const posts = useMemo(() => {
        if (!unsortedPosts) return [];
        return [...unsortedPosts].sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
            return dateB - dateA;
        });
    }, [unsortedPosts]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-8">
                        <Skeleton className="h-10 w-64" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => <PostCardSkeleton key={i} />)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Explore Blog Posts</h1>
                        <p className="text-muted-foreground">Discover insights, stories, and ideas from our community</p>
                    </div>
                    
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <h3 className="text-xl font-semibold">No posts available</h3>
                            <p className="text-muted-foreground mt-2">Check back later for new content.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
