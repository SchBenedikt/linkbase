'use client';

import { collection, query, where, doc, setDoc } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Link as LinkIcon, Edit, Eye, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Page } from '@/lib/types';
import { UserNav } from '@/components/user-nav';

export default function DashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const pagesQuery = useMemoFirebase(() =>
        user ? query(collection(firestore, 'pages'), where('ownerId', '==', user.uid)) : null,
        [user, firestore]
    );
    const { data: pages, isLoading: arePagesLoading } = useCollection<Page>(pagesQuery);

    const handleCreateNewPage = async () => {
        if (!user) return;
        const slug = `seite-${Math.random().toString(36).substring(2, 9)}`;
        const newPageData = {
            ownerId: user.uid,
            slug: slug,
            displayName: 'Unbenannte Seite',
            bio: 'Füge hier eine Beschreibung hinzu.',
            avatarUrl: '',
            avatarHint: '',
            backgroundColor: '#ffffff',
            foregroundColor: '#111827',
            primaryColor: '#6366f1',
            accentColor: '#ec4899',
            cardColor: '#ffffff',
            cardForegroundColor: '#111827',
            borderRadius: 1.25,
            borderWidth: 0,
            borderColor: '#e5e7eb',
        };
        try {
            const docRef = await addDocumentNonBlocking(collection(firestore, 'pages'), newPageData);
            if (docRef) {
                // Also create the initial slug lookup document
                const slugRef = doc(firestore, 'slug_lookups', slug);
                await setDoc(slugRef, { pageId: docRef.id });
                router.push(`/edit/${docRef.id}`);
            }
        } catch(e) {
            console.error("Error creating new page", e);
        }
    };
    
    if (isUserLoading || arePagesLoading) {
        return (
            <div className="min-h-screen bg-secondary/30">
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
        <div className="min-h-screen bg-secondary/30">
            <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                    <h1 className="font-headline text-2xl font-bold text-foreground">
                        Dashboard
                    </h1>
                    <UserNav />
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">Ihre Seiten</h2>
                    <Button onClick={handleCreateNewPage}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Neue Seite erstellen
                    </Button>
                </div>

                {pages && pages.length > 0 ? (
                    <div className="grid gap-6">
                        {pages.map((page) => (
                            <Card key={page.id} className="shadow-lg hover:shadow-xl transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-2xl font-bold">{page.displayName}</CardTitle>
                                    <LinkIcon className="h-6 w-6 text-muted-foreground" />
                                </CardHeader>
                                <CardDescription className="px-6 pb-4">
                                    <Link href={`/${page.slug}`} target="_blank" className="text-primary hover:underline flex items-center gap-1">
                                        biobloom.co/{page.slug} <Eye className="h-4 w-4" />
                                    </Link>
                                </CardDescription>
                                <CardFooter className="flex justify-between">
                                    <p className="text-sm text-muted-foreground">{page.bio || 'Keine Beschreibung.'}</p>
                                    <Button asChild>
                                        <Link href={`/edit/${page.id}`}>
                                            Bearbeiten <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <h3 className="text-xl font-semibold">Noch keine Seiten erstellt</h3>
                        <p className="text-muted-foreground mt-2 mb-4">Starten Sie, indem Sie Ihre erste BioBloom-Seite erstellen.</p>
                        <Button onClick={handleCreateNewPage}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Erste Seite erstellen
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
