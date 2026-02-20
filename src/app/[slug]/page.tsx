
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useFirestore, initializeFirebase } from '@/firebase';
import type { Page, Link as LinkType, SlugLookup, AppearanceSettings } from '@/lib/types';
import { hexToHsl, getContrastColor } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileHeader } from '@/components/profile-header';
import { LinkList } from '@/components/link-list';

const initialAppearance: AppearanceSettings = {
    backgroundImage: '',
    backgroundColor: '#f0f0f0',
    primaryColor: '#6366f1',
    accentColor: '#d2e822',
    foregroundColor: '#111827',
    cardColor: '#ffffff',
    cardForegroundColor: '#111827',
    borderRadius: 1.25,
    borderWidth: 0,
    borderColor: '#e5e7eb',
};

export default function PublicPage({ params }: { params: { slug: string } }) {
    const { slug } = params;
    // We can't use the useFirestore hook here as this component isn't inside the provider tree by default.
    // So we initialize a temporary instance. This is safe.
    const { firestore } = initializeFirebase();

    const [page, setPage] = useState<Page | null>(null);
    const [links, setLinks] = useState<LinkType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dynamicStyles, setDynamicStyles] = useState<React.CSSProperties>({});
    const [appearance, setAppearance] = useState<AppearanceSettings>(initialAppearance);

    useEffect(() => {
        if (!slug || !firestore) return;

        const fetchPage = async () => {
            try {
                setLoading(true);
                const slugRef = doc(firestore, 'slug_lookups', slug);
                const slugSnap = await getDoc(slugRef);

                if (!slugSnap.exists()) {
                    setError('Page not found.');
                    return;
                }

                const { pageId } = slugSnap.data() as SlugLookup;
                const pageRef = doc(firestore, 'pages', pageId);
                const linksQuery = query(collection(firestore, 'pages', pageId, 'links'), orderBy('orderIndex'));

                const [pageSnap, linksSnap] = await Promise.all([
                    getDoc(pageRef),
                    getDocs(linksQuery)
                ]);

                if (pageSnap.exists()) {
                    const pageData = { id: pageSnap.id, ...pageSnap.data() } as Page;
                    setPage(pageData);

                    const dbAppearance = pageData as unknown as AppearanceSettings;
                    const newAppearance: AppearanceSettings = {
                        backgroundColor: dbAppearance.backgroundColor || initialAppearance.backgroundColor,
                        primaryColor: dbAppearance.primaryColor || initialAppearance.primaryColor,
                        accentColor: dbAppearance.accentColor || initialAppearance.accentColor,
                        cardColor: dbAppearance.cardColor || initialAppearance.cardColor,
                        cardForegroundColor: dbAppearance.cardForegroundColor || initialAppearance.cardForegroundColor,
                        borderRadius: dbAppearance.borderRadius ?? initialAppearance.borderRadius,
                        borderWidth: dbAppearance.borderWidth ?? initialAppearance.borderWidth,
                        borderColor: dbAppearance.borderColor || initialAppearance.borderColor,
                        backgroundImage: dbAppearance.backgroundImage || initialAppearance.backgroundImage,
                        foregroundColor: dbAppearance.foregroundColor || getContrastColor(dbAppearance.backgroundColor) || initialAppearance.foregroundColor,
                    };
                    setAppearance(newAppearance);
                    setDynamicStyles({
                        '--radius': `${newAppearance.borderRadius ?? 1.25}rem`,
                        '--background': hexToHsl(newAppearance.backgroundColor),
                        '--foreground': hexToHsl(newAppearance.foregroundColor),
                        '--card': hexToHsl(newAppearance.cardColor),
                        '--card-foreground': hexToHsl(newAppearance.cardForegroundColor),
                        '--primary': hexToHsl(newAppearance.primaryColor),
                        '--primary-foreground': getContrastColor(newAppearance.primaryColor),
                        '--accent': hexToHsl(newAppearance.accentColor),
                        '--accent-foreground': getContrastColor(newAppearance.accentColor),
                        '--border': hexToHsl(newAppearance.borderColor),
                    });

                } else {
                    setError('Page data not found.');
                }
                
                setLinks(linksSnap.docs.map(d => ({ id: d.id, ...d.data() } as LinkType)));

            } catch (e) {
                console.error(e);
                setError('Could not load page.');
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, [slug, firestore]);

    const mainStyle: React.CSSProperties = {};
    if (appearance.backgroundImage) {
        mainStyle.backgroundImage = `url(${appearance.backgroundImage})`;
        mainStyle.backgroundSize = 'cover';
        mainStyle.backgroundPosition = 'center';
        mainStyle.backgroundAttachment = 'fixed';
    }
    
    if (loading) {
        return (
            <div className="min-h-screen bg-background p-8">
                <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
                    <Skeleton className="w-28 h-28 rounded-full mb-6" />
                    <Skeleton className="h-12 w-64 mb-4" />
                    <Skeleton className="h-6 w-96 mb-10" />
                    <Skeleton className="w-full h-48 mb-4" />
                    <Skeleton className="w-full h-48" />
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen"><h1>{error}</h1></div>;
    }
    
    if (!page) {
        return <div className="flex items-center justify-center min-h-screen"><h1>Loading page...</h1></div>;
    }

    return (
        <div style={dynamicStyles}>
             <main className="flex flex-col items-center min-h-screen p-4 sm:p-6 md:p-8 transition-colors duration-500 text-foreground" style={mainStyle}>
                <div className="w-full max-w-2xl mx-auto">
                    <ProfileHeader page={page} isEditable={false} />
                    <LinkList
                        links={links || []}
                        appearance={appearance}
                        isEditable={false}
                    />
                </div>
                <footer className="w-full max-w-2xl mx-auto mt-12 mb-6 text-center">
                    <a href="/" className="text-sm text-muted-foreground hover:text-primary font-semibold">
                        Powered by BioBloom
                    </a>
                </footer>
            </main>
        </div>
    );
}
