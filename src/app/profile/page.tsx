'use client';

import { useState, useEffect } from 'react';
import type { Profile, Link, AITheme } from '@/lib/types';
import { ProfileHeader } from '@/components/profile-header';
import { LinkList } from '@/components/link-list';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ShareButton } from '@/components/share-button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ProfileEditor } from '@/components/profile-editor';
import { LinkEditor } from '@/components/link-editor';

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

type SheetState = 
  | { view: 'editProfile'; open: true }
  | { view: 'addLink'; open: true }
  | { view: 'editLink'; open: true; link: Link }
  | { open: false };

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [themeStyle, setThemeStyle] = useState<React.CSSProperties>({});
  
  // This is to avoid hydration mismatch for browser-specific APIs
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [sheetState, setSheetState] = useState<SheetState>({ open: false });
  const [linkToDelete, setLinkToDelete] = useState<Link | null>(null);

  const closeSheet = () => setSheetState({ open: false });

  const handleSaveProfile = (data: { name: string; bio?: string }) => {
    setProfile({ ...profile, ...data });
    closeSheet();
  };

  const handleSaveLink = (data: { title: string; url: string }) => {
    if (sheetState.open && sheetState.view === 'editLink') {
      // Update existing link
      const updatedLink = { ...sheetState.link, ...data };
      setLinks(links.map((l) => (l.id === updatedLink.id ? updatedLink : l)));
    } else {
      // Add new link
      const randomImage = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
      const newLink: Link = {
        id: Date.now().toString(),
        ...data,
        thumbnailUrl: randomImage.imageUrl,
        thumbnailHint: randomImage.imageHint,
      };
      setLinks([newLink, ...links]);
    }
    closeSheet();
  };
  
  const confirmDeleteLink = () => {
    if (linkToDelete) {
      setLinks(links.filter((l) => l.id !== linkToDelete.id));
      setLinkToDelete(null);
    }
  };


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

  const renderSheetContent = () => {
    if (!sheetState.open) return null;
    switch (sheetState.view) {
      case 'editProfile':
        return <ProfileEditor profile={profile} onSave={handleSaveProfile} onCancel={closeSheet} />;
      case 'addLink':
        return <LinkEditor onSave={handleSaveLink} onCancel={closeSheet} />;
      case 'editLink':
        return <LinkEditor link={sheetState.link} onSave={handleSaveLink} onCancel={closeSheet} />;
      default:
        return null;
    }
  };

  const getSheetTitle = () => {
     if (!sheetState.open) return '';
     switch (sheetState.view) {
        case 'editProfile': return 'Edit your Profile';
        case 'addLink': return 'Add a new Link';
        case 'editLink': return 'Edit your Link';
     }
  }

  const getSheetDescription = () => {
    if (!sheetState.open) return '';
     switch (sheetState.view) {
        case 'editProfile': return "Update your name and bio. Click save when you're done.";
        case 'addLink': return "Add a new link to your profile. Click save when you're done.";
        case 'editLink': return "Update your link details. Click save when you're done.";
     }
  }

  return (
    <div style={themeStyle as React.CSSProperties}>
      <main className="flex flex-col items-center min-h-screen p-4 sm:p-6 md:p-8 transition-colors duration-500 bg-background">
        <div className="w-full max-w-2xl mx-auto">
          <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
            {isClient && <ShareButton />}
            <ThemeSwitcher onThemeApply={handleThemeApply} />
          </div>
          <ProfileHeader profile={profile} onEdit={() => setSheetState({ view: 'editProfile', open: true })} />
          <LinkList
            links={links}
            onAddLink={() => setSheetState({ view: 'addLink', open: true })}
            onEditLink={(link) => setSheetState({ view: 'editLink', open: true, link })}
            onDeleteLink={setLinkToDelete}
          />
        </div>
        <footer className="w-full max-w-2xl mx-auto mt-12 mb-6 text-center">
            <p className="text-sm text-muted-foreground">
                Powered by <span className="font-semibold text-primary">BioBloom</span>
            </p>
        </footer>
      </main>

      <Sheet open={sheetState.open} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{getSheetTitle()}</SheetTitle>
            <SheetDescription>{getSheetDescription()}</SheetDescription>
          </SheetHeader>
          <div className="py-4">{renderSheetContent()}</div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!linkToDelete} onOpenChange={(open) => !open && setLinkToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the link titled "{linkToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLinkToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDeleteLink}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
