'use client';

import { useState, useEffect } from 'react';
import type { Page, Link as LinkType, AppearanceSettings } from '@/lib/types';
import { hexToHsl, getContrastColor, isColorLight } from '@/lib/utils';
import { ProfileHeader } from '@/components/profile-header';
import { LinkList } from '@/components/link-list';
import { useTheme } from '@/components/theme-provider';

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

export default function PublicPageComponent({ page, links }: { page: Page, links: LinkType[] }) {
    const { theme } = useTheme();
    const [dynamicStyles, setDynamicStyles] = useState<React.CSSProperties>({});
    const [appearance, setAppearance] = useState<AppearanceSettings>(initialAppearance);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

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

        // Recalculate foregrounds if theme was transformed or if they were never set.
        effectiveAppearance.foregroundColor = (!wasThemeTransformed && dbAppearance.foregroundColor) ? dbAppearance.foregroundColor : getContrastColor(effectiveAppearance.backgroundColor);
        effectiveAppearance.cardForegroundColor = (!wasThemeTransformed && dbAppearance.cardForegroundColor) ? dbAppearance.cardForegroundColor : getContrastColor(effectiveAppearance.cardColor);
        
        setAppearance(effectiveAppearance);

        setDynamicStyles({
            '--radius': `${effectiveAppearance.borderRadius ?? 1.25}rem`,
            '--background': hexToHsl(effectiveAppearance.backgroundColor),
            '--foreground': isHex(effectiveAppearance.foregroundColor) ? hexToHsl(effectiveAppearance.foregroundColor) : effectiveAppearance.foregroundColor,
            '--card': hexToHsl(effectiveAppearance.cardColor),
            '--card-foreground': isHex(effectiveAppearance.cardForegroundColor) ? hexToHsl(effectiveAppearance.cardForegroundColor) : effectiveAppearance.cardForegroundColor,
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
                        Powered by BioBloom
                    </a>
                </footer>
            </main>
        </div>
    );
}
