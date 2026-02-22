'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, collection, writeBatch } from 'firebase/firestore';
import { z } from 'zod';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import type { Page, Link as LinkType, AITheme, AppearanceSettings } from '@/lib/types';
import { arrayMove } from '@dnd-kit/sortable';


import { ProfileHeader } from '@/components/profile-header';
import { LinkList } from '@/components/link-list';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ShareButton } from '@/components/share-button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ProfileEditor, profileSchema } from '@/components/profile-editor';
import { AddContentDialog } from '@/components/add-content-dialog';
import { hexToHsl, getContrastColor, isColorLight } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { UserNav } from '@/components/user-nav';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Zap, ZapOff } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';


type SheetState = 
  | { view: 'editProfile'; open: true }
  | { view: 'addContent'; open: true }
  | { view: 'editContent'; open: true; content: LinkType }
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
  fontFamily: 'Bricolage Grotesque',
};


export default function EditPage() {
  const params = useParams();
  const pageId = params.pageId as string;
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { theme } = useTheme();

  const [sheetState, setSheetState] = useState<SheetState>({ open: false });
  const [linkToDelete, setLinkToDelete] = useState<LinkType | null>(null);
  const appearanceSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAppearanceLocalRef = useRef(false);

  // Firestore references
  const pageRef = useMemoFirebase(() => pageId ? doc(firestore, 'pages', pageId) : null, [firestore, pageId]);
  const linksRef = useMemoFirebase(() => pageId ? collection(firestore, 'pages', pageId, 'links') : null, [firestore, pageId]);

  const { data: page, isLoading: isPageLoading, error: pageError, setData: setPageData } = useDoc<Page>(pageRef);
  const { data: links, isLoading: areLinksLoading, error: linksError, setData: setLinksData } = useCollection<LinkType>(linksRef);
  
  const [appearance, setAppearance] = useState<AppearanceSettings>(initialAppearance);
  const [dynamicStyles, setDynamicStyles] = useState<React.CSSProperties>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Redirect if not logged in or not the owner
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (!isPageLoading && page && user && page.ownerId !== user.uid) {
        // If the user is not the owner of the page, redirect to their dashboard
        console.warn('User is not the owner of this page.');
        router.push('/dashboard');
    }
  }, [isUserLoading, user, router, isPageLoading, page]);


  // Update appearance when page data changes, and on theme changes.
  // Skip when the update was triggered by our own local appearance save.
  useEffect(() => {
    if (!page || !isClient) return;
    if (isAppearanceLocalRef.current) return;

    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const dbAppearance = page as unknown as AppearanceSettings;
    
    let effectiveAppearance = { ...initialAppearance, ...dbAppearance };
    const wasThemeTransformed = isDarkMode && isColorLight(dbAppearance.backgroundColor);

    if (wasThemeTransformed) {
        effectiveAppearance.backgroundColor = '#111827';
        effectiveAppearance.cardColor = isColorLight(dbAppearance.cardColor) ? '#1f2937' : dbAppearance.cardColor!;
        effectiveAppearance.borderColor = '#374151';
    }

    effectiveAppearance.foregroundColor = (!wasThemeTransformed && dbAppearance.foregroundColor) ? dbAppearance.foregroundColor : getContrastColor(effectiveAppearance.backgroundColor);
    effectiveAppearance.cardForegroundColor = (!wasThemeTransformed && dbAppearance.cardForegroundColor) ? dbAppearance.cardForegroundColor : getContrastColor(effectiveAppearance.cardColor);
    
    setAppearance(effectiveAppearance);

    const isHex = (s: string | undefined): s is string => !!s && s.startsWith('#');

    setDynamicStyles({
        '--radius': `${effectiveAppearance.borderRadius ?? 1.25}rem`,
        '--background': hexToHsl(effectiveAppearance.backgroundColor),
        '--foreground': isHex(effectiveAppearance.foregroundColor) ? hexToHsl(effectiveAppearance.foregroundColor) : effectiveAppearance.foregroundColor,
        '--card': hexToHsl(effectiveAppearance.cardColor),
        '--card-foreground': isHex(effectiveAppearance.cardForegroundColor) ? hexToHsl(effectiveAppearance.cardForegroundColor) : effectiveAppearance.cardForegroundColor,
        '--popover': hexToHsl(effectiveAppearance.cardColor),
        '--popover-foreground': isHex(effectiveAppearance.cardForegroundColor) ? hexToHsl(effectiveAppearance.cardForegroundColor) : effectiveAppearance.cardForegroundColor,
        '--primary': hexToHsl(effectiveAppearance.primaryColor),
        '--primary-foreground': getContrastColor(effectiveAppearance.primaryColor),
        '--accent': hexToHsl(effectiveAppearance.accentColor),
        '--accent-foreground': getContrastColor(effectiveAppearance.accentColor),
        '--border': hexToHsl(effectiveAppearance.borderColor),
        '--input': hexToHsl(effectiveAppearance.backgroundColor),
        '--ring': hexToHsl(effectiveAppearance.primaryColor),
    });

  }, [page, theme, isClient]);


  const closeSheet = () => setSheetState({ open: false });

  const handleSaveProfile = (data: z.infer<typeof profileSchema>) => {
    if (!pageRef || !page || !firestore) return;

    const oldSlug = page.slug;
    const newSlug = data.slug;

    const { categories, ...restData } = data;
    const categoriesArray = categories
      ? categories.split(',').map(c => c.trim()).filter(Boolean)
      : [];
    
    const dataToSave = {
        ...restData,
        categories: categoriesArray
    };

    setDocumentNonBlocking(pageRef, dataToSave, { merge: true });

    if (newSlug && newSlug !== oldSlug) {
        if (oldSlug) {
            deleteDocumentNonBlocking(doc(firestore, 'slug_lookups', oldSlug));
        }
        setDocumentNonBlocking(doc(firestore, 'slug_lookups', newSlug), { pageId: page.id });
    }
    
    closeSheet();
  };

  const handleSaveContent = (data: Partial<LinkType> & { type: LinkType['type'] }) => {
    if (!linksRef || !pageId) return;

    if (sheetState.open && sheetState.view === 'editContent') {
      const contentToUpdate = sheetState.content;
      const updatedData = { ...contentToUpdate, ...data };
      setLinksData(links => links!.map(l => l.id === contentToUpdate.id ? updatedData : l));
      const linkRef = doc(linksRef, contentToUpdate.id);
      setDocumentNonBlocking(linkRef, data, { merge: true });
    } else {
      const tempId = crypto.randomUUID();
      const newContent: LinkType = {
        id: tempId,
        pageId: pageId,
        orderIndex: links?.length || 0,
        title: data.title || 'Untitled',
        type: data.type,
        ...data,
      };

      if (newContent.type === 'link' && !newContent.thumbnailUrl) {
        const randomImage = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
        newContent.thumbnailUrl = randomImage.imageUrl;
        newContent.thumbnailHint = randomImage.imageHint;
      }
      
      setLinksData(prev => [...(prev || []), newContent]);
      
      const { id, ...dataToSave } = newContent;
      
      addDocumentNonBlocking(linksRef, dataToSave).then(docRef => {
        if (docRef) {
          setLinksData(prev => prev!.map(l => l.id === tempId ? { ...l, id: docRef.id } : l));
        }
      });
    }
    closeSheet();
  };
  
  const confirmDeleteLink = () => {
    if (linkToDelete && linksRef) {
      deleteDocumentNonBlocking(doc(linksRef, linkToDelete.id));
      setLinksData(prev => prev!.filter(l => l.id !== linkToDelete.id));
      setLinkToDelete(null);
    }
  };

  const handleDragEnd = (activeId: string, overId: string) => {
    if (!links || !linksRef || !firestore) return;

    const oldIndex = links.findIndex(l => l.id === activeId);
    const newIndex = links.findIndex(l => l.id === overId);

    if (oldIndex === -1 || newIndex === -1) return;

    const newLinksOrder = arrayMove(links, oldIndex, newIndex);
    
    setLinksData(newLinksOrder);

    const batch = writeBatch(firestore);
    newLinksOrder.forEach((link, index) => {
        if (link.orderIndex !== index) {
            const linkRef = doc(linksRef, link.id);
            batch.update(linkRef, { orderIndex: index });
        }
    });
    batch.commit();
  };


  const generateStylesFromAppearance = (settings: AppearanceSettings): React.CSSProperties => {
    const isHex = (s: string | undefined): s is string => !!s && s.startsWith('#');
    return {
        '--radius': `${settings.borderRadius ?? 1.25}rem`,
        '--background': hexToHsl(settings.backgroundColor),
        '--foreground': isHex(settings.foregroundColor) ? hexToHsl(settings.foregroundColor) : settings.foregroundColor,
        '--card': hexToHsl(settings.cardColor),
        '--card-foreground': isHex(settings.cardForegroundColor) ? hexToHsl(settings.cardForegroundColor) : settings.cardForegroundColor,
        '--popover': hexToHsl(settings.cardColor),
        '--popover-foreground': isHex(settings.cardForegroundColor) ? hexToHsl(settings.cardForegroundColor) : settings.cardForegroundColor,
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
      // Mark that the next Firestore snapshot is caused by our own write,
      // so the appearance useEffect won't overwrite local state.
      isAppearanceLocalRef.current = true;

      // Debounce writes: wait 400 ms after the last call before writing to Firestore.
      if (appearanceSaveTimerRef.current) {
        clearTimeout(appearanceSaveTimerRef.current);
      }
      appearanceSaveTimerRef.current = setTimeout(() => {
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
          fontFamily: newSettings.fontFamily,
        };
        setDocumentNonBlocking(pageRef, dataToSave, { merge: true });
        // Reset flag shortly after the write so future external changes are applied.
        setTimeout(() => { isAppearanceLocalRef.current = false; }, 2000);
      }, 400);
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
  
  const handleToggleStatus = () => {
    if (!pageRef || !page) return;
    const newStatus = page.status === 'published' ? 'draft' : 'published';
    setDocumentNonBlocking(pageRef, { status: newStatus }, { merge: true });
  };

  const renderSheetContent = () => {
    if (!sheetState.open || !page) return null;
    switch (sheetState.view) {
      case 'editProfile':
        return <ProfileEditor page={page} onSave={handleSaveProfile} onCancel={closeSheet} />;
      case 'addContent':
        return <AddContentDialog onSave={handleSaveContent} onCancel={closeSheet} />;
      case 'editContent':
        return <AddContentDialog onSave={handleSaveContent} onCancel={closeSheet} contentToEdit={sheetState.content} />;
      default:
        return null;
    }
  };

  const isDarkMode = isClient && (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
  const isOriginalThemeLight = isColorLight(page?.backgroundColor);

  const mainStyle: React.CSSProperties = {
    fontFamily: appearance.fontFamily || "'Bricolage Grotesque', sans-serif",
  };

  if (appearance.backgroundImage && !(isDarkMode && isOriginalThemeLight)) {
      mainStyle.backgroundImage = `url(${appearance.backgroundImage})`;
      mainStyle.backgroundSize = 'cover';
      mainStyle.backgroundPosition = 'center';
      mainStyle.backgroundAttachment = 'fixed';
  }

  if (isUserLoading || isPageLoading) {
    return (
        <div className="min-h-screen bg-background p-8">
            <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
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
        <div className="flex items-center justify-center min-h-screen bg-background">
            <p>Loading page or you do not have permission...</p>
        </div>
      )
  }
  
  return (
    <div style={dynamicStyles as React.CSSProperties}>
      <main className="min-h-screen p-4 sm:p-6 md:p-8 transition-colors duration-500 bg-background text-foreground" style={mainStyle}>
        <div className="w-full max-w-7xl mx-auto">
          <header className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
              <Button variant="outline" asChild>
                <Link href="/dashboard">&larr; Back to Dashboard</Link>
              </Button>
            <div className="flex items-center gap-2">
              <Badge variant={page.status === 'published' ? 'default' : 'secondary'} className="capitalize">
                {page.status}
              </Badge>
              <Button onClick={handleToggleStatus} variant="outline" size="sm">
                {page.status === 'published' ? <ZapOff className="mr-2 h-4 w-4" /> : <Zap className="mr-2 h-4 w-4" />}
                {page.status === 'published' ? 'Unpublish' : 'Publish'}
              </Button>
              {page.slug && page.status === 'published' && <ShareButton publicUrl={`${window.location.origin}/${page.slug}`} />}
              <ThemeSwitcher 
                onThemeApply={handleThemeApply}
                onAppearanceSave={handleAppearanceSave}
                initialAppearance={appearance}
              />
              <ThemeToggle />
              <UserNav />
            </div>
          </header>
          
          <div className="grid md:grid-cols-3 gap-8 pt-24">
            <aside className="md:col-span-1 md:sticky md:top-24 h-fit">
              <ProfileHeader page={page} onEdit={() => setSheetState({ view: 'editProfile', open: true })} isEditable={true} />
            </aside>
            <div className="md:col-span-2">
              <LinkList
                links={links || []}
                ownerId={page?.ownerId}
                onAddLink={() => setSheetState({ view: 'addContent', open: true })}
                onEditLink={(link) => setSheetState({ view: 'editContent', open: true, content: link })}
                onDeleteLink={setLinkToDelete}
                onDragEnd={handleDragEnd}
                appearance={appearance}
                isEditable={true}
              />
            </div>
          </div>
        </div>
      </main>

      <Sheet open={sheetState.open} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>
                {sheetState.open && sheetState.view === 'editProfile' && 'Edit your Page'}
                {sheetState.open && sheetState.view === 'addContent' && 'Add new content'}
                {sheetState.open && sheetState.view === 'editContent' && 'Edit your Content'}
            </SheetTitle>
            <SheetDescription>
                {sheetState.open && sheetState.view === 'editProfile' && "Update your page details. Click save when you're done."}
                {sheetState.open && sheetState.view === 'addContent' && "Select the type of content you want to add to your page."}
                {sheetState.open && sheetState.view === 'editContent' && "Update your content's details. Click save when you're done."}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1 mt-4">
            <div className="pb-8 pr-1">{renderSheetContent()}</div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!linkToDelete} onOpenChange={(open) => !open && setLinkToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this content block.
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
