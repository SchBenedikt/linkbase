'use client';

import { useState, useEffect } from 'react';
import type { Profile, Link, AITheme, AppearanceSettings } from '@/lib/types';
import { ProfileHeader } from '@/components/profile-header';
import { LinkList } from '@/components/link-list';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ShareButton } from '@/components/share-button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ProfileEditor } from '@/components/profile-editor';
import { LinkEditor } from '@/components/link-editor';
import { hexToHsl, getContrastColor } from '@/lib/utils';

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

const initialAppearance: AppearanceSettings = {
  backgroundImage: '',
  backgroundColor: '#f0f0f0',
  primaryColor: '#6366f1',
  accentColor: '#ec4899',
  foregroundColor: '#111827',
  cardColor: '#ffffff',
  cardForegroundColor: '#111827',
  borderRadius: 1.25,
  borderWidth: 0,
  borderColor: '#e5e7eb',
};


export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [links, setLinks] = useState<Link[]>(initialLinks);
  
  const [dynamicStyles, setDynamicStyles] = useState<React.CSSProperties>({});
  const [appearance, setAppearance] = useState<AppearanceSettings>(initialAppearance);
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    handleAppearanceSave(initialAppearance);
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
      const updatedLink = { ...sheetState.link, ...data };
      setLinks(links.map((l) => (l.id === updatedLink.id ? updatedLink : l)));
    } else {
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

  const generateStylesFromAppearance = (settings: AppearanceSettings): React.CSSProperties => {
    const styles: React.CSSProperties = {
        '--radius': `${settings.borderRadius ?? 1.25}rem`,
        '--background': hexToHsl(settings.backgroundColor),
        '--foreground': hexToHsl(settings.foregroundColor),
        '--card': hexToHsl(settings.cardColor),
        '--card-foreground': hexToHsl(settings.cardForegroundColor),
        '--popover': hexToHsl(settings.cardColor),
        '--popover-foreground': hexToHsl(settings.cardForegroundColor),
        '--primary': hexToHsl(settings.primaryColor),
        '--primary-foreground': getContrastColor(settings.primaryColor),
        '--accent': hexToHsl(settings.accentColor),
        '--accent-foreground': getContrastColor(settings.accentColor),
        '--border': hexToHsl(settings.borderColor),
        '--input': hexToHsl(settings.backgroundColor),
        '--ring': hexToHsl(settings.primaryColor),
    };
    return styles;
  }

  const handleAppearanceSave = (settings: AppearanceSettings) => {
    setAppearance(settings);
    setDynamicStyles(generateStylesFromAppearance(settings));
  };


  const handleThemeApply = (theme: AITheme) => {
    const primaryPalette = theme.colorPalettes.find(p => p.name.toLowerCase().includes('primary')) || theme.colorPalettes[0];
    const accentPalette = theme.colorPalettes.find(p => p.name.toLowerCase().includes('accent')) || theme.colorPalettes[1] || primaryPalette;
    const backgroundPalette = theme.colorPalettes.find(p => p.name.toLowerCase().includes('background')) || theme.colorPalettes[2] || accentPalette;
    
    if (primaryPalette && accentPalette && backgroundPalette) {
      const newAppearance: AppearanceSettings = {
        ...appearance,
        backgroundColor: backgroundPalette.colors[0],
        cardColor: backgroundPalette.colors[1] || backgroundPalette.colors[0],
        borderColor: backgroundPalette.colors[2] || backgroundPalette.colors[1],
        primaryColor: primaryPalette.colors[0],
        accentColor: accentPalette.colors[0],
        foregroundColor: getContrastColor(backgroundPalette.colors[0]),
        cardForegroundColor: getContrastColor(backgroundPalette.colors[1] || backgroundPalette.colors[0]),
      };
      handleAppearanceSave(newAppearance);
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

  const mainStyle: React.CSSProperties = {};
  if (appearance.backgroundImage) {
      mainStyle.backgroundImage = `url(${appearance.backgroundImage})`;
      mainStyle.backgroundSize = 'cover';
      mainStyle.backgroundPosition = 'center';
      mainStyle.backgroundAttachment = 'fixed';
  }

  return (
    <div style={dynamicStyles as React.CSSProperties}>
      <main className="flex flex-col items-center min-h-screen p-4 sm:p-6 md:p-8 transition-colors duration-500 text-foreground" style={mainStyle}>
        <div className="w-full max-w-2xl mx-auto">
          <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
            {isClient && <ShareButton />}
            <ThemeSwitcher 
              onThemeApply={handleThemeApply}
              onAppearanceSave={handleAppearanceSave}
              initialAppearance={appearance}
            />
          </div>
          <ProfileHeader profile={profile} onEdit={() => setSheetState({ view: 'editProfile', open: true })} />
          <LinkList
            links={links}
            onAddLink={() => setSheetState({ view: 'addLink', open: true })}
            onEditLink={(link) => setSheetState({ view: 'editLink', open: true, link })}
            onDeleteLink={setLinkToDelete}
            appearance={appearance}
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
