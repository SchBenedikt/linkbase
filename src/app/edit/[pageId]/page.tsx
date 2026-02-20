
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { doc, collection, writeBatch } from 'firebase/firestore';
import { z } from 'zod';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import type { Page, Link as LinkType, AITheme, AppearanceSettings } from '@/lib/types';
import { arrayMove } from '@dnd-kit/sortable';

import { ProfileHeader } from '@/components/profile-header';
import { LinkList } from '@/components/link-list';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ShareButton } from '@/components/share-button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ProfileEditor, profileSchema } from '@/components/profile-editor';
import { LinkEditor } from '@/components/link-editor';
import { hexToHsl, getContrastColor } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { UserNav } from '@/components/user-nav';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type SheetState = 
  | { view: 'editProfile'; open: true }
  | { view: 'addLink'; open: true }
  | { view: 'editLink'; open: true; link: LinkType }
  | { open: false };

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

const linkEditorSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Please enter a valid URL'),
  colSpan: z.number().min(1).max(4).default(1),
  rowSpan: z.number().min(1).max(2).default(1),
});

export default function EditPage({ params }: { params: { pageId: string } }) {
  const resolvedParams = use(Promise.resolve(params));
  const { pageId } = resolvedParams;
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [sheetState, setSheetState] = useState<SheetState>({ open: false });
  const [linkToDelete, setLinkToDelete] = useState<LinkType | null>(null);

  // Firestore references
  const pageRef = useMemoFirebase(() => pageId ? doc(firestore, 'pages', pageId) : null, [firestore, pageId]);
  const linksRef = useMemoFirebase(() => pageId ? collection(firestore, 'pages', pageId, 'links') : null, [firestore, pageId]);

  const { data: page, isLoading: isPageLoading, error: pageError, setData: setPageData } = useDoc<Page>(pageRef);
  const { data: links, isLoading: areLinksLoading, error: linksError, setData: setLinksData } = useCollection<LinkType>(linksRef);
  
  const [appearance, setAppearance] = useState<AppearanceSettings>(initialAppearance);
  const [dynamicStyles, setDynamicStyles] = useState<React.CSSProperties>({});
  
  // Redirect if not logged in or not the owner
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (!isPageLoading && page && user && page.ownerId !== user.uid) {
        // If the user is not the owner of the page, redirect to their dashboard
        console.warn('User is not the owner of this page.');
        router.push('/profile');
    }
  }, [isUserLoading, user, router, isPageLoading, page]);


  // Update appearance when page data changes
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
    };
    handleAppearanceSave(newAppearance, false); // Don't save back to DB on initial load
  }, [page]);


  const closeSheet = () => setSheetState({ open: false });

  const handleSaveProfile = async (data: z.infer<typeof profileSchema>) => {
    if (!pageRef || !page || !firestore) return;

    const oldSlug = page.slug;
    const newSlug = data.slug;

    const batch = writeBatch(firestore);
    batch.set(pageRef, data, { merge: true });

    if (newSlug && newSlug !== oldSlug) {
        if (oldSlug) {
            batch.delete(doc(firestore, 'slug_lookups', oldSlug));
        }
        batch.set(doc(firestore, 'slug_lookups', newSlug), { pageId: page.id });
    }
    
    await batch.commit();
    closeSheet();
  };

  const handleSaveLink = (data: z.infer<typeof linkEditorSchema>) => {
    if (!linksRef || !pageId) return;
    if (sheetState.open && sheetState.view === 'editLink') {
      const linkRef = doc(linksRef, sheetState.link.id);
      setDocumentNonBlocking(linkRef, data, { merge: true });
    } else {
      const randomImage = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
      const newLinkData = {
        ...data,
        thumbnailUrl: randomImage.imageUrl,
        thumbnailHint: randomImage.imageHint,
        pageId: pageId,
        orderIndex: (links?.length || 0) + 1,
      };
      addDocumentNonBlocking(linksRef, newLinkData);
    }
    closeSheet();
  };
  
  const confirmDeleteLink = () => {
    if (linkToDelete && linksRef) {
      const linkRef = doc(linksRef, linkToDelete.id);
      deleteDocumentNonBlocking(linkRef);
      setLinkToDelete(null);
    }
  };

  const handleDragEnd = async (activeId: string, overId: string) => {
    if (!links || !linksRef || !firestore) return;

    const oldIndex = links.findIndex(l => l.id === activeId);
    const newIndex = links.findIndex(l => l.id === overId);

    const newLinksOrder = arrayMove(links, oldIndex, newIndex);
    
    // Optimistically update UI
    setLinksData(newLinksOrder);

    // Update orderIndex in Firestore
    const batch = writeBatch(firestore);
    newLinksOrder.forEach((link, index) => {
        const linkRef = doc(linksRef, link.id);
        batch.update(linkRef, { orderIndex: index });
    });

    try {
        await batch.commit();
    } catch(e) {
        console.error("Failed to reorder links", e);
        // Optionally revert UI state
        setLinksData(links);
    }
  };


  const generateStylesFromAppearance = (settings: AppearanceSettings): React.CSSProperties => {
    return {
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
  }

  const handleAppearanceSave = (settings: AppearanceSettings, saveToDb = true) => {
    const newSettings = {...appearance, ...settings};
    setAppearance(newSettings);
    setDynamicStyles(generateStylesFromAppearance(newSettings));
    if (pageRef && saveToDb) {
      const dataToSave = {
        backgroundColor: newSettings.backgroundColor,
        primaryColor: newSettings.primaryColor,
        accentColor: newSettings.accentColor,
        foregroundColor: newSettings.foregroundColor,
        cardColor: newSettings.cardColor,
        cardForegroundColor: newSettings.cardForegroundColor,
        borderRadius: newSettings.borderRadius,
        borderWidth: newSettings.borderWidth,
        borderColor: newSettings.borderColor,
        backgroundImage: newSettings.backgroundImage,
      };
      setDocumentNonBlocking(pageRef, dataToSave, { merge: true });
    }
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
    if (!sheetState.open || !page) return null;
    switch (sheetState.view) {
      case 'editProfile':
        return <ProfileEditor page={page} onSave={handleSaveProfile} onCancel={closeSheet} />;
      case 'addLink':
        return <LinkEditor onSave={handleSaveLink} onCancel={closeSheet} />;
      case 'editLink':
        return <LinkEditor link={sheetState.link} onSave={handleSaveLink} onCancel={closeSheet} />;
      default:
        return null;
    }
  };

  const mainStyle: React.CSSProperties = {};
  if (appearance.backgroundImage) {
      mainStyle.backgroundImage = `url(${appearance.backgroundImage})`;
      mainStyle.backgroundSize = 'cover';
      mainStyle.backgroundPosition = 'center';
      mainStyle.backgroundAttachment = 'fixed';
  }

  if (isUserLoading || isPageLoading) {
    return (
        <div className="min-h-screen bg-[#f3f3f1] p-8">
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                <div className="w-full flex justify-end gap-2 mb-8">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <Skeleton className="w-28 h-28 rounded-full mb-6" />
                <Skeleton className="h-12 w-64 mb-4" />
                <Skeleton className="h-6 w-96 mb-10" />
                <div className="w-full grid grid-cols-4 gap-4">
                    <Skeleton className="h-40 col-span-2" />
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40 col-span-3" />
                </div>
            </div>
        </div>
    );
  }

  if (!user || !page) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#f3f3f1]">
            <p>Loading page or you do not have permission...</p>
        </div>
      )
  }
  
  return (
    <div style={dynamicStyles as React.CSSProperties}>
      <main className="flex flex-col items-center min-h-screen p-4 sm:p-6 md:p-8 transition-colors duration-500 text-foreground" style={mainStyle}>
        <div className="w-full max-w-4xl mx-auto">
          <div className="fixed top-4 left-4 z-50">
            <Button variant="outline" asChild>
              <Link href="/profile">&larr; Back to Dashboard</Link>
            </Button>
          </div>
          <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
            <ShareButton publicUrl={`${window.location.origin}/${page.slug}`} />
            <ThemeSwitcher 
              onThemeApply={handleThemeApply}
              onAppearanceSave={handleAppearanceSave}
              initialAppearance={appearance}
            />
            <UserNav />
          </div>
          <ProfileHeader page={page} onEdit={() => setSheetState({ view: 'editProfile', open: true })} isEditable={true} />
          <LinkList
            links={links || []}
            onAddLink={() => setSheetState({ view: 'addLink', open: true })}
            onEditLink={(link) => setSheetState({ view: 'editLink', open: true, link })}
            onDeleteLink={setLinkToDelete}
            onDragEnd={handleDragEnd}
            appearance={appearance}
            isEditable={true}
          />
        </div>
        <footer className="w-full max-w-4xl mx-auto mt-12 mb-6 text-center">
            <p className="text-sm text-muted-foreground">
                Powered by <span className="font-semibold text-primary">BioBloom</span>
            </p>
        </footer>
      </main>

      <Sheet open={sheetState.open} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="bg-[#f3f3f1]">
          <SheetHeader>
            <SheetTitle>
                {sheetState.open && sheetState.view === 'editProfile' && 'Edit your Page'}
                {sheetState.open && sheetState.view === 'addLink' && 'Add a new Link'}
                {sheetState.open && sheetState.view === 'editLink' && 'Edit your Link'}
            </SheetTitle>
            <SheetDescription>
                {sheetState.open && sheetState.view === 'editProfile' && "Update your page details. Click save when you're done."}
                {sheetState.open && (sheetState.view === 'addLink' || sheetState.view === 'editLink') && "Update your link details. Click save when you're done."}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">{renderSheetContent()}</div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!linkToDelete} onOpenChange={(open) => !open && setLinkToDelete(null)}>
        <AlertDialogContent className="bg-[#f3f3f1]">
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
