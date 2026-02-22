'use client';
import { useState, useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Post } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';
import { Search, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function PostCard({ post }: { post: Post }) {
    const publicationDate = post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMM d, yyyy') : '...';
    const excerpt = post.excerpt || (post.content ? post.content.substring(0, 150).replace(/\s+/g, ' ').trim() + (post.content.length > 150 ? '…' : '') : '');

    return (
        <Link href={`/post/${post.id}`} className="group block">
            <article className="flex flex-col h-full rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-md">
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
                    {post.category && (
                        <Badge variant="secondary" className="mb-2 w-fit text-xs">{post.category}</Badge>
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
                        <Link
                            href={post.authorPageSlug ? `/${post.authorPageSlug}` : '#'}
                            className="flex items-center gap-2 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Avatar className="h-7 w-7">
                                <AvatarImage src={post.authorAvatarUrl} />
                                <AvatarFallback className="text-xs">{post.authorName?.charAt(0) || 'A'}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium text-muted-foreground">{post.authorName}</span>
                        </Link>
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

export function BlogExploreView() {
    const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>('All');

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

    const categories = useMemo(() => {
        if (!posts) return [];
        return ['All', ...[...new Set(posts.map(p => p.category).filter(Boolean))] as string[]];
    }, [posts]);

    const filteredPosts = useMemo(() => {
        if (!posts) return [];
        return posts.filter(post => {
            const matchesCategory = !selectedCategory || selectedCategory === 'All' || post.category === selectedCategory;
            const term = searchTerm.toLowerCase();
            const matchesSearch = !term ||
                post.title.toLowerCase().includes(term) ||
                post.authorName?.toLowerCase().includes(term) ||
                post.excerpt?.toLowerCase().includes(term) ||
                post.category?.toLowerCase().includes(term);
            return matchesCategory && matchesSearch;
        });
    }, [posts, searchTerm, selectedCategory]);

    if (isLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <PostCardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search posts by title, author…"
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {categories.length > 1 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    selectedCategory === category
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">No posts found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your search or filter.</p>
                </div>
            )}
        </div>
    );
}
