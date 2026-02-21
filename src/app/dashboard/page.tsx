'use client';

import { useState, useMemo } from 'react';
import { collection, query, where, doc, setDoc, getDocs, addDoc } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Eye, Edit, Trash2, Search, Zap, ZapOff } from 'lucide-react';
import Link from 'next/link';
import type { Page } from '@/lib/types';
import { UserNav } from '@/components/user-nav';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';


export default function DashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const pagesQuery = useMemoFirebase(() =>
        user ? query(collection(firestore, 'pages'), where('ownerId', '==', user.uid)) : null,
        [user, firestore]
    );
    const { data: pages, isLoading: arePagesLoading } = useCollection<Page>(pagesQuery);

    const filteredPages = useMemo(() => {
        if (!pages) return [];
        return pages.filter(page => 
            page.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            page.slug.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [pages, searchQuery]);

    const handleCreateNewPage = async () => {
        if (!user || !firestore) return;
        const slug = `page-${Math.random().toString(36).substring(2, 9)}`;
        const newPageData = {
            ownerId: user.uid,
            slug: slug,
            displayName: 'Untitled Page',
            bio: 'Add a description here.',
            avatarUrl: 'https://picsum.photos/seed/avatar/200',
            avatarHint: 'placeholder',
            status: 'draft' as const,
            backgroundColor: '#ffffff',
            foregroundColor: '#111827',
            primaryColor: '#6366f1',
            accentColor: '#d2e822',
            cardColor: '#ffffff',
            cardForegroundColor: '#111827',
            borderRadius: 1.25,
            borderWidth: 0,
            borderColor: '#e5e7eb',
            fontFamily: 'Bricolage Grotesque',
        };
        try {
            const docRef = await addDoc(collection(firestore, 'pages'), newPageData);
            // Also create the initial slug lookup document
            const slugRef = doc(firestore, 'slug_lookups', slug);
            await setDoc(slugRef, { pageId: docRef.id });
            router.push(`/edit/${docRef.id}`);
        } catch(e) {
            console.error("Error creating new page", e);
        }
    };

    const handleConfirmDelete = async () => {
        if (!pageToDelete || !firestore) return;

        try {
            // 1. Delete all links in the subcollection
            const linksQuery = query(collection(firestore, 'pages', pageToDelete.id, 'links'));
            const linksSnapshot = await getDocs(linksQuery);
            linksSnapshot.forEach(linkDoc => {
                deleteDocumentNonBlocking(linkDoc.ref);
            });

            // 2. Delete the slug lookup
            if (pageToDelete.slug) {
                const slugRef = doc(firestore, 'slug_lookups', pageToDelete.slug);
                deleteDocumentNonBlocking(slugRef);
            }

            // 3. Delete the page itself
            const pageRef = doc(firestore, 'pages', pageToDelete.id);
            deleteDocumentNonBlocking(pageRef);

        } catch (error) {
            console.error("Error deleting page:", error);
            // Optionally, show a toast notification for the error
        } finally {
            setPageToDelete(null); // Close the dialog
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
        <div className="min-h-screen bg-background">
            <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                    <h1 className="font-headline text-2xl font-bold text-foreground">
                        Dashboard
                    </h1>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <UserNav />
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">Your Pages</h2>
                    <Button onClick={handleCreateNewPage}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Page
                    </Button>
                </div>
                
                <div className="mb-8 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search pages by name or slug..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>


                {filteredPages && filteredPages.length > 0 ? (
                    <div className="grid gap-6">
                        {filteredPages.map((page) => (
                            <Card key={page.id} className="shadow-none border">
                                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                                    <div>
                                        <CardTitle className="text-2xl font-bold">{page.displayName}</CardTitle>
                                        <CardDescription className="pt-2">
                                           {page.slug && (
                                                <Link href={`/${page.slug}`} target="_blank" className="text-primary hover:underline flex items-center gap-1">
                                                    biobloom.co/{page.slug} <Eye className="h-4 w-4" />
                                                </Link>
                                            )}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={page.status === 'published' ? 'default' : 'secondary'} className="capitalize">
                                        {page.status}
                                    </Badge>
                                </CardHeader>
                                <CardFooter className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground truncate pr-4">{page.bio || 'No description.'}</p>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Button variant="outline" size="sm" onClick={() => togglePageStatus(page)}>
                                            {page.status === 'published' ? <ZapOff className="mr-2 h-4 w-4" /> : <Zap className="mr-2 h-4 w-4" />}
                                            {page.status === 'published' ? 'Unpublish' : 'Publish'}
                                        </Button>
                                        <Button asChild>
                                            <Link href={`/edit/${page.id}`}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button variant="destructive" onClick={() => setPageToDelete(page)}>
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
                        <h3 className="text-xl font-semibold">{searchQuery ? 'No pages found' : 'No pages created yet'}</h3>
                        <p className="text-muted-foreground mt-2 mb-4">
                           {searchQuery ? 'Try a different search term.' : 'Get started by creating your first BioBloom page.'}
                        </p>
                        {!searchQuery && (
                            <Button onClick={handleCreateNewPage}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create First Page
                            </Button>
                        )}
                    </div>
                )}
            </main>
            <AlertDialog open={!!pageToDelete} onOpenChange={(open) => !open && setPageToDelete(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the page "{pageToDelete?.displayName}" and all associated links.
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
