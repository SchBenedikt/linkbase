'use client';

import { useState, useMemo, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, where, doc, getDocs, addDoc, setDoc } from 'firebase/firestore';
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
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DashboardNav } from '@/components/dashboard-nav';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const createPageSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  slug: z.string().min(3, 'Username must be at least 3 characters.').regex(/^[a-z0-9-]+$/, 'Username can only contain lowercase letters, numbers, and hyphens.'),
});

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
    
    const form = useForm<z.infer<typeof createPageSchema>>({
        resolver: zodResolver(createPageSchema),
        defaultValues: {
          firstName: user?.displayName?.split(' ')[0] || '',
          lastName: user?.displayName?.split(' ')[1] || '',
          slug: '',
        },
    });

    const handleCreateFirstPage = async (data: z.infer<typeof createPageSchema>) => {
        if (!user || !firestore) return;

        startCreateTransition(async () => {
            const { slug, firstName, lastName } = data;
            const slugRef = doc(firestore, 'slug_lookups', slug);
            const slugSnap = await getDoc(slugRef);

            if (slugSnap.exists()) {
                form.setError('slug', { message: 'This username is already taken.' });
                return;
            }
            
            const newPageData = {
                ownerId: user.uid,
                slug: slug,
                firstName: firstName,
                lastName: lastName,
                bio: 'A short bio about yourself.',
                avatarUrl: `https://picsum.photos/seed/${slug}/200`,
                avatarHint: 'placeholder',
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
            };

            try {
                const pageDocRef = await addDoc(collection(firestore, 'pages'), newPageData);
                const slugDocRef = doc(firestore, 'slug_lookups', slug);
                await setDoc(slugDocRef, { pageId: pageDocRef.id });
                // No need to redirect, useCollection will update the UI.
            } catch(e) {
                console.error("Error creating new page", e);
                // Optionally, show a toast notification on error
            }
        });
    };


    const filteredPages = useMemo(() => {
        if (!pages) return [];
        return pages.filter(page => 
            `${page.firstName} ${page.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            page.slug.toLowerCase().includes(searchQuery.toLowerCase())
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
                {pages && pages.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold tracking-tight">Your Pages</h2>
                            {/* We might allow creating more pages in the future */}
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

                        {filteredPages.length > 0 ? (
                            <div className="grid gap-6">
                                {filteredPages.map((page) => (
                                    <Card key={page.id} className="shadow-none border">
                                        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                                            <div>
                                                <CardTitle className="text-2xl font-bold">{page.firstName} {page.lastName}</CardTitle>
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
                    <div className="flex justify-center py-16">
                        <Card className="w-full max-w-lg">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold">Create Your Profile Page</CardTitle>
                                <CardDescription>Claim your username and set up your page. You can customize everything later.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleCreateFirstPage)} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="firstName"
                                                render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>First Name</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="lastName"
                                                render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Last Name</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="slug"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Username</FormLabel>
                                                    <div className="flex items-center">
                                                        <span className="text-sm text-muted-foreground px-3 py-2 bg-muted rounded-l-md border border-r-0">biobloom.co/</span>
                                                        <FormControl>
                                                            <Input {...field} className="rounded-l-none" placeholder="your-name" />
                                                        </FormControl>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" disabled={isCreating} className="w-full">
                                            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Create Page
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
            <AlertDialog open={!!pageToDelete} onOpenChange={(open) => !open && setPageToDelete(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the page "{pageToDelete?.firstName} {pageToDelete?.lastName}" and all associated links.
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
