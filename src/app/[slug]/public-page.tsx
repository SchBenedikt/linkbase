'use client';

import { useState, useEffect } from 'react';
import type { Page, Link as LinkType, AppearanceSettings } from '@/lib/types';
import { hexToHsl, getContrastColor, isColorLight } from '@/lib/utils';
import { ProfileHeader } from '@/components/profile-header';
import { LinkList } from '@/components/link-list';
import { useTheme } from '@/components/theme-provider';
import { doc, setDoc, increment } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

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
    fontFamily: 'Bricolage Grotesque',
};

const isHex = (s: string | undefined): s is string => !!s && s.startsWith('#');

export default function PublicPageComponent({ page, links, publicUrl }: { page: Page, links: LinkType[], publicUrl: string }) {
    const { theme } = useTheme();
    const firestore = useFirestore();
    const [dynamicStyles, setDynamicStyles] = useState<React.CSSProperties>({});
    const [appearance, setAppearance] = useState<AppearanceSettings>(initialAppearance);
    const [isClient, setIsClient] = useState(false);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: [page.firstName, page.lastName].filter(Boolean).join(' '),
        url: publicUrl,
        image: page.avatarUrl,
        description: page.bio,
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || !page?.id || !firestore) return;
        const today = new Date().toISOString().split('T')[0];
        const viewRef = doc(firestore, 'pages', page.id, 'page_views', today);
        setDoc(viewRef, { pageId: page.id, date: today, count: increment(1) }, { merge: true }).catch((err) => console.warn('Failed to track page view:', err));
    }, [page.id, isClient, firestore]);

    useEffect(() => {
        if (!page || !isClient) return;

        const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        const dbAppearance = page as unknown as AppearanceSettings;
        
        let effectiveAppearance = { ...initialAppearance, ...dbAppearance };
        const wasThemeTransformed = isDarkMode && isColorLight(dbAppearance.backgroundColor);

        if (wasThemeTransformed) {
            effectiveAppearance.backgroundColor = '#111827';
            effectiveAppearance.cardColor = isColorLight(dbAppearance.cardColor) ? '#1f2937' : dbAppearance.cardColor!;
            effectiveAppearance.borderColor = '#374151';
        }

        // Get raw values (hex from DB or raw HSL from getContrastColor)
        const rawFg = (!wasThemeTransformed && dbAppearance.foregroundColor) ? dbAppearance.foregroundColor : getContrastColor(effectiveAppearance.backgroundColor);
        const rawCardFg = (!wasThemeTransformed && dbAppearance.cardForegroundColor) ? dbAppearance.cardForegroundColor : getContrastColor(effectiveAppearance.cardColor);

        // Set appearance state with valid CSS color values for direct use in child components
        setAppearance({
          ...effectiveAppearance,
          foregroundColor: isHex(rawFg) ? rawFg : `hsl(${rawFg})`,
          cardForegroundColor: isHex(rawCardFg) ? rawCardFg : `hsl(${rawCardFg})`,
        });

        // Set dynamic styles with raw HSL values for use with `hsl(var(--...))` in CSS
        setDynamicStyles({
            '--radius': `${effectiveAppearance.borderRadius ?? 1.25}rem`,
            '--background': hexToHsl(effectiveAppearance.backgroundColor),
            '--foreground': isHex(rawFg) ? hexToHsl(rawFg) : rawFg,
            '--card': hexToHsl(effectiveAppearance.cardColor),
            '--card-foreground': isHex(rawCardFg) ? hexToHsl(rawCardFg) : rawCardFg,
            '--primary': hexToHsl(effectiveAppearance.primaryColor),
            '--primary-foreground': getContrastColor(effectiveAppearance.primaryColor),
            '--accent': hexToHsl(effectiveAppearance.accentColor),
            '--accent-foreground': getContrastColor(effectiveAppearance.accentColor),
            '--border': hexToHsl(effectiveAppearance.borderColor),
        });

    }, [page, theme, isClient]);

    const isDarkMode = isClient && (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
    const isOriginalThemeLight = isColorLight(page.backgroundColor);

    const mainStyle: React.CSSProperties = {
        fontFamily: appearance.fontFamily || "'Bricolage Grotesque', sans-serif"
    };

    if (appearance.backgroundImage && !(isDarkMode && isOriginalThemeLight)) {
        mainStyle.backgroundImage = `url(${appearance.backgroundImage})`;
        mainStyle.backgroundSize = 'cover';
        mainStyle.backgroundPosition = 'center';
        mainStyle.backgroundAttachment = 'fixed';
    }

    return (
        <div style={dynamicStyles}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
             <main className="min-h-screen p-4 sm:p-6 md:p-8 transition-colors duration-500 bg-background text-foreground" style={mainStyle}>
                <div className="w-full max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                    <aside className="md:col-span-1 md:sticky md:top-8 h-fit">
                        <ProfileHeader page={page} isEditable={false} />
                    </aside>
                    <div className="md:col-span-2">
                        <LinkList
                            links={links || []}
                            ownerId={page?.ownerId}
                            appearance={appearance}
                            isEditable={false}
                        />
                    </div>
                </div>
                <footer className="w-full max-w-7xl mx-auto mt-12 mb-6 text-center">
                    <a href="/" className="text-sm text-muted-foreground hover:text-primary font-semibold">
                        Powered by Linkbase
                    </a>
                </footer>
            </main>
        </div>
    );
}
