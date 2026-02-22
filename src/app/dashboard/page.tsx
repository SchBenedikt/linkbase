'use client';

import { useState, useMemo, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, where, doc, getDocs, addDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Eye, Edit, Trash2, Search, Zap, ZapOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Page } from '@/lib/types';
import { UserNav } from '@/components/user-nav';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DashboardNav } from '@/components/dashboard-nav';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export default function DashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreating, startCreateTransition] = useTransition();

    const pagesQuery = useMemoFirebase(() =>
        user ? query(collection(firestore, 'pages'), where('ownerId', '==', user.uid)) : null,
        [user, firestore]
    );
    const { data: pages, isLoading: arePagesLoading } = useCollection<Page>(pagesQuery);
    
    const handleCreatePage = async () => {
        if (!user || !firestore) return;

        startCreateTransition(async () => {
            const defaultSlug = `untitled-${Date.now()}`;
            
            const newPageData = {
                ownerId: user.uid,
                slug: defaultSlug,
                title: 'Untitled Page',
                status: 'draft' as const,
                backgroundColor: '#f0f0f0',
                foregroundColor: '#111827',
                primaryColor: '#6366f1',
                accentColor: '#d2e822',
                cardColor: '#ffffff',
                cardForegroundColor: '#111827',
                borderRadius: 1.25,
                borderWidth: 0,
                borderColor: '#e5e7eb',
                fontFamily: 'Bricolage Grotesque',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            try {
                const pageDocRef = await addDoc(collection(firestore, 'pages'), newPageData);
                const slugDocRef = doc(firestore, 'slug_lookups', defaultSlug);
                await setDoc(slugDocRef, { pageId: pageDocRef.id });
                router.push(`/edit/${pageDocRef.id}`);
            } catch(e) {
                console.error("Error creating new page", e);
                // Optionally, show a toast notification on error
            }
        });
    };


    const filteredPages = useMemo(() => {
        if (!pages) return [];
        return pages.filter(page => 
            (page.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (page.slug || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [pages, searchQuery]);

    const handleConfirmDelete = async () => {
        if (!pageToDelete || !firestore) return;

        try {
            const linksQuery = query(collection(firestore, 'pages', pageToDelete.id, 'links'));
            const linksSnapshot = await getDocs(linksQuery);
            linksSnapshot.forEach(linkDoc => {
                deleteDocumentNonBlocking(linkDoc.ref);
            });

            if (pageToDelete.slug) {
                const slugRef = doc(firestore, 'slug_lookups', pageToDelete.slug);
                deleteDocumentNonBlocking(slugRef);
            }

            const pageRef = doc(firestore, 'pages', pageToDelete.id);
            deleteDocumentNonBlocking(pageRef);

        } catch (error) {
            console.error("Error deleting page:", error);
        } finally {
            setPageToDelete(null); 
        }
    };

    const togglePageStatus = (page: Page) => {
        if (!firestore) return;
        const newStatus = page.status === 'published' ? 'draft' : 'published';
        const pageRef = doc(firestore, 'pages', page.id);
        setDocumentNonBlocking(pageRef, { status: newStatus }, { merge: true });
    };
    
    if (isUserLoading || arePagesLoading) {
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
                        <Skeleton className="h-10 w-64" />
                     </div>
                    <div className="grid gap-6">
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
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">Your Pages</h2>
                    <Button onClick={handleCreatePage} disabled={isCreating}>
                        {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                        Create New Page
                    </Button>
                </div>
                
                {pages && pages.length > 0 ? (
                    <>
                        <div className="mb-8 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search pages by name or slug..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {filteredPages.length > 0 ? (
                            <div className="grid gap-6">
                                {filteredPages.map((page) => (
                                    <Card key={page.id} className="shadow-none border">
                                        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                                            <div>
                                                <CardTitle className="text-2xl font-bold">
                                                    {[page.firstName, page.lastName].filter(Boolean).join(' ') || page.title || 'Untitled Page'}
                                                </CardTitle>
                                                <CardDescription className="pt-2">
                                                {page.slug && (
                                                        <Link href={`/${page.slug}`} target="_blank" className="text-primary hover:underline flex items-center gap-1">
                                                            links.schächner.de/{page.slug} <Eye className="h-4 w-4" />
                                                        </Link>
                                                    )}
                                                </CardDescription>
                                            </div>
                                            <Badge variant={page.status === 'published' ? 'default' : 'secondary'} className="capitalize">
                                                {page.status}
                                            </Badge>
                                        </CardHeader>
                                        <CardFooter className="flex justify-between items-center">
                                            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                                                <Button variant="outline" size="sm" onClick={() => togglePageStatus(page)}>
                                                    {page.status === 'published' ? <ZapOff className="mr-2 h-4 w-4" /> : <Zap className="mr-2 h-4 w-4" />}
                                                    {page.status === 'published' ? 'Unpublish' : 'Publish'}
                                                </Button>
                                                <Button asChild size="sm">
                                                    <Link href={`/edit/${page.id}`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => setPageToDelete(page)}>
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
                                <h3 className="text-xl font-semibold">No pages found</h3>
                                <p className="text-muted-foreground mt-2">Try a different search term.</p>
                            </div>
                         )}
                    </>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <h3 className="text-xl font-semibold">No pages created yet</h3>
                        <p className="text-muted-foreground mt-2 mb-4">Get started by creating your first page.</p>
                        <Button onClick={handleCreatePage} disabled={isCreating}>
                            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                            Create First Page
                        </Button>
                    </div>
                )}
            </main>
            <AlertDialog open={!!pageToDelete} onOpenChange={(open) => !open && setPageToDelete(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the page "{pageToDelete?.title}" and all associated links.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setPageToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleConfirmDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
        </div>
    );
}
