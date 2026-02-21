'use client';

import { useMemo, useState } from 'react';
import { collection, query, where, doc } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Edit, BookOpen, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { Post } from '@/lib/types';
import { UserNav } from '@/components/user-nav';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ThemeToggle } from '@/components/theme-toggle';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardNav } from '@/components/dashboard-nav';
import { BlogExploreView } from '@/components/blog-explore-view';


export default function BlogDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const [postToDelete, setPostToDelete] = useState<Post | null>(null);

    const postsQuery = useMemoFirebase(() =>
        user ? query(collection(firestore, 'posts'), where('ownerId', '==', user.uid)) : null,
        [user, firestore]
    );

    const { data: unsortedPosts, isLoading: arePostsLoading } = useCollection<Post>(postsQuery);
    
    const posts = useMemo(() => {
        if (!unsortedPosts) return [];
        return [...unsortedPosts].sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
            return dateB - dateA; // Sort descending
        });
    }, [unsortedPosts]);

    const handleConfirmDelete = () => {
        if (!postToDelete || !firestore) return;

        try {
            const postRef = doc(firestore, 'posts', postToDelete.id);
            deleteDocumentNonBlocking(postRef);
        } catch (error) {
            console.error("Error deleting post:", error);
        } finally {
            setPostToDelete(null); 
        }
    };


    if (isUserLoading || arePostsLoading) {
        return (
            <div className="min-h-screen bg-background">
                <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                        <Skeleton className="h-8 w-64" />
                        <div className="flex items-center gap-2">
                           <Skeleton className="h-8 w-8 rounded-full" />
                           <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    </div>
                </header>
                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                     <div className="flex items-center justify-between mb-8">
                        <Skeleton className="h-10 w-96" />
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
        <div className="min-h-screen bg-background">
            <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                    <DashboardNav />
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <UserNav />
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs defaultValue="manage" className="w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <TabsList>
                            <TabsTrigger value="manage">Manage Posts</TabsTrigger>
                            <TabsTrigger value="explore">Explore All Posts</TabsTrigger>
                        </TabsList>
                         <Button asChild>
                            <Link href="/blog/edit/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Post
                            </Link>
                        </Button>
                    </div>
                    <TabsContent value="manage">
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
                                                <Button variant="destructive" onClick={() => setPostToDelete(post)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
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
                    </TabsContent>
                    <TabsContent value="explore">
                       <BlogExploreView />
                    </TabsContent>
                </Tabs>
            </main>
             <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the post "{postToDelete?.title}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setPostToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleConfirmDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
        </div>
    );
}
