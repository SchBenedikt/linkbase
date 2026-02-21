'use client';

import { useState, useEffect } from 'react';
import type { Page, Link as LinkType, AppearanceSettings } from '@/lib/types';
import { hexToHsl, getContrastColor } from '@/lib/utils';
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
    fontFamily: 'Bricolage Grotesque',
};

export default function PublicPageComponent({ page, links }: { page: Page, links: LinkType[] }) {
    const [dynamicStyles, setDynamicStyles] = useState<React.CSSProperties>({});
    const [appearance, setAppearance] = useState<AppearanceSettings>(initialAppearance);

    useEffect(() => {
        if (!page) return;

        const dbAppearance = page as unknown as AppearanceSettings;
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
            fontFamily: dbAppearance.fontFamily || initialAppearance.fontFamily,
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
    }, [page]);

    const mainStyle: React.CSSProperties = {
        fontFamily: appearance.fontFamily || "'Bricolage Grotesque', sans-serif"
    };
    if (appearance.backgroundImage) {
        mainStyle.backgroundImage = `url(${appearance.backgroundImage})`;
        mainStyle.backgroundSize = 'cover';
        mainStyle.backgroundPosition = 'center';
        mainStyle.backgroundAttachment = 'fixed';
    }

    return (
        <div style={dynamicStyles}>
             <main className="min-h-screen p-4 sm:p-6 md:p-8 transition-colors duration-500 text-foreground" style={mainStyle}>
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
                        Powered by BioBloom
                    </a>
                </footer>
            </main>
        </div>
    );
}
