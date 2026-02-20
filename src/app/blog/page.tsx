'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Edit, BookOpen } from 'lucide-react';
import Link from 'next/link';
import type { Post } from '@/lib/types';
import { UserNav } from '@/components/user-nav';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function BlogDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    // Query for all posts by the user, but without ordering.
    // Ordering on one field while filtering on another requires a composite index.
    // By removing orderBy, we avoid this requirement. Sorting will be done on the client.
    const postsQuery = useMemoFirebase(() =>
        user ? query(collection(firestore, 'posts'), where('ownerId', '==', user.uid)) : null,
        [user, firestore]
    );

    // Fetch all posts (drafts and published) with one hook.
    const { data: unsortedPosts, isLoading: arePostsLoading } = useCollection<Post>(postsQuery);
    
    // Sort the fetched posts on the client-side.
    const posts = useMemo(() => {
        if (!unsortedPosts) return [];
        return [...unsortedPosts].sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
            return dateB - dateA; // Sort descending
        });
    }, [unsortedPosts]);


    if (isUserLoading || arePostsLoading) {
        return (
            <div className="min-h-screen bg-[#f3f3f1]">
                <header className="bg-[#f3f3f1]/80 backdrop-blur-md border-b sticky top-0 z-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </header>
                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                     <div className="flex items-center justify-between mb-8">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-10 w-36" />
                    </div>
                    <div className="grid gap-6">
                        <Skeleton className="h-36 w-full" />
                        <Skeleton className="h-36 w-full" />
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f3f3f1]">
            <header className="bg-[#f3f3f1]/80 backdrop-blur-md border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                    <h1 className="font-headline text-2xl font-bold text-foreground">
                        Blog
                    </h1>
                    <UserNav />
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">Your Posts</h2>
                    <Button asChild>
                        <Link href="/blog/edit/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Post
                        </Link>
                    </Button>
                </div>

                {posts && posts.length > 0 ? (
                    <div className="grid gap-6">
                        {posts.map((post) => (
                            <Card key={post.id} className="shadow-none border">
                                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                                    <div>
                                        <CardTitle className="text-2xl font-bold">{post.title}</CardTitle>
                                        <CardDescription className="pt-2">
                                            {post.createdAt?.toDate ? format(post.createdAt.toDate(), 'PPP') : '...'}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="capitalize">
                                        {post.status}
                                    </Badge>
                                </CardHeader>
                                <CardFooter className="flex justify-end items-center">
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {post.status === 'published' && (
                                            <Button variant="outline" asChild>
                                                <Link href={`/post/${post.id}`} target="_blank">
                                                    <BookOpen className="mr-2 h-4 w-4" />
                                                    View
                                                </Link>
                                            </Button>
                                        )}
                                        <Button asChild>
                                            <Link href={`/blog/edit/${post.id}`}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </Link>
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <h3 className="text-xl font-semibold">No posts written yet</h3>
                        <p className="text-muted-foreground mt-2 mb-4">Get started by writing your first blog post.</p>
                        <Button asChild>
                            <Link href="/blog/edit/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create First Post
                            </Link>
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
