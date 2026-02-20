'use client';

import { useState, useEffect } from 'react';
import type { Profile, Link, AITheme } from '@/lib/types';
import { ProfileHeader } from '@/components/profile-header';
import { LinkList } from '@/components/link-list';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ShareButton } from '@/components/share-button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const initialProfile: Profile = {
  name: 'Jamie Doe',
  bio: 'Creator, dreamer, and coffee enthusiast. Building my little corner of the internet.',
  avatarUrl: PlaceHolderImages.find(p => p.id === 'profile-avatar')?.imageUrl || '',
  avatarHint: PlaceHolderImages.find(p => p.id === 'profile-avatar')?.imageHint || '',
};

const initialLinks: Link[] = [
  { id: '1', title: 'My Work', url: '#', thumbnailUrl: PlaceHolderImages.find(p => p.id === 'link-thumb-1')?.imageUrl || '', thumbnailHint: PlaceHolderImages.find(p => p.id === 'link-thumb-1')?.imageHint || '' },
  { id: '2', title: 'Connect on Social', url: '#', thumbnailUrl: PlaceHolderImages.find(p => p.id === 'link-thumb-2')?.imageUrl || '', thumbnailHint: PlaceHolderImages.find(p => p.id === 'link-thumb-2')?.imageHint || '' },
  { id: '3', title: 'Latest Adventure', url: '#', thumbnailUrl: PlaceHolderImages.find(p => p.id === 'link-thumb-3')?.imageUrl || '', thumbnailHint: PlaceHolderImages.find(p => p.id === 'link-thumb-3')?.imageHint || '' },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [themeStyle, setThemeStyle] = useState<React.CSSProperties>({});
  
  // This is to avoid hydration mismatch for browser-specific APIs
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const hexToHsl = (H: string | undefined): string => {
    if (!H) return '0 0% 0%';
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
      r = Number("0x" + H[1] + H[1]);
      g = Number("0x" + H[2] + H[2]);
      b = Number("0x" + H[3] + H[3]);
    } else if (H.length == 7) {
      r = Number("0x" + H[1] + H[2]);
      g = Number("0x" + H[3] + H[4]);
      b = Number("0x" + H[5] + H[6]);
    }
    r /= 255; g /= 255; b /= 255;
    let cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin, h = 0, s = 0, l = 0;
    if (delta == 0) h = 0;
    else if (cmax == r) h = ((g - b) / delta) % 6;
    else if (cmax == g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
    return `${h} ${s}% ${l}%`;
  };

  const getContrastColor = (H: string | undefined): string => {
    if (!H) return '0 0% 98%';
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
      r = Number("0x" + H[1] + H[1]);
      g = Number("0x" + H[2] + H[2]);
      b = Number("0x" + H[3] + H[3]);
    } else if (H.length == 7) {
      r = Number("0x" + H[1] + H[2]);
      g = Number("0x" + H[3] + H[4]);
      b = Number("0x" + H[5] + H[6]);
    }
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '240 10% 3.9%' : '0 0% 98%';
  };

  const handleThemeApply = (theme: AITheme) => {
    const primaryPalette = theme.colorPalettes.find(p => p.name.toLowerCase().includes('primary')) || theme.colorPalettes[0];
    const accentPalette = theme.colorPalettes.find(p => p.name.toLowerCase().includes('accent')) || theme.colorPalettes[1] || primaryPalette;
    const backgroundPalette = theme.colorPalettes.find(p => p.name.toLowerCase().includes('background')) || theme.colorPalettes[2] || accentPalette;
    
    if (primaryPalette && accentPalette && backgroundPalette) {
      const newBackground = backgroundPalette.colors[0];
      const newCard = backgroundPalette.colors[1] || newBackground;

      setThemeStyle({
        '--background': hexToHsl(newBackground),
        '--foreground': getContrastColor(newBackground),
        '--card': hexToHsl(newCard),
        '--card-foreground': getContrastColor(newCard),
        '--popover': hexToHsl(newCard),
        '--popover-foreground': getContrastColor(newCard),
        '--primary': hexToHsl(primaryPalette.colors[0]),
        '--primary-foreground': getContrastColor(primaryPalette.colors[0]),
        '--accent': hexToHsl(accentPalette.colors[0]),
        '--accent-foreground': getContrastColor(accentPalette.colors[0]),
        '--border': hexToHsl(backgroundPalette.colors[2] || newCard),
        '--input': hexToHsl(backgroundPalette.colors[2] || newCard),
        '--ring': hexToHsl(primaryPalette.colors[0]),
      });
    }
  };

  return (
    <div style={themeStyle as React.CSSProperties}>
      <main className="flex flex-col items-center min-h-screen p-4 sm:p-6 md:p-8 transition-colors duration-500 bg-background">
        <div className="w-full max-w-2xl mx-auto">
          <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
            {isClient && <ShareButton />}
            <ThemeSwitcher onThemeApply={handleThemeApply} />
          </div>
          <ProfileHeader profile={profile} setProfile={setProfile} />
          <LinkList links={links} setLinks={setLinks} />
        </div>
        <footer className="w-full max-w-2xl mx-auto mt-12 mb-6 text-center">
            <p className="text-sm text-muted-foreground">
                Powered by <span className="font-semibold text-primary">BioBloom</span>
            </p>
        </footer>
      </main>
    </div>
  );
}
