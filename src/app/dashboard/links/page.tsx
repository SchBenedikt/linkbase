'use client';

import { useState, useMemo, useCallback } from 'react';
import { collection, query, where, doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Info, Link2, PlusCircle, Trash2 } from 'lucide-react';
import type { ShortLink } from '@/lib/types';
import { DashboardNav } from '@/components/dashboard-nav';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { ShortLinkItem } from '@/components/short-link-item';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/** Generates a random alphanumeric code of a given length */
function generateCode(len = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  arr.forEach((n) => { result += chars[n % chars.length]; });
  return result;
}

const siteUrl = (typeof window !== 'undefined' ? window.location.origin : null)
  || process.env.NEXT_PUBLIC_SITE_URL
  || '';

export default function LinksPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<ShortLink | null>(null);
  const [search, setSearch] = useState('');

  const shortLinksQuery = useMemoFirebase(
    () => (user && firestore && !isUserLoading)
      ? query(collection(firestore, 'short_links'), where('ownerId', '==', user.uid))
      : null,
    [user, firestore, isUserLoading]
  );

  const { data: unsortedLinks, isLoading } = useCollection<ShortLink>(shortLinksQuery);

  const links = useMemo(() => {
    if (!unsortedLinks) return [];
    return [...unsortedLinks].sort((a, b) => {
      const ta = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const tb = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return tb - ta;
    });
  }, [unsortedLinks]);

  const filteredLinks = useMemo(() => {
    if (!search.trim()) return links;
    const needle = search.trim().toLowerCase();
    return links.filter((link) => {
      const title = link.title?.toLowerCase() || '';
      const url = link.originalUrl?.toLowerCase() || '';
      const code = link.code?.toLowerCase() || '';
      return title.includes(needle) || url.includes(needle) || code.includes(needle);
    });
  }, [links, search]);

  const handleCreate = useCallback(async () => {
    if (!user || !firestore) return;
    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl) {
      toast({ variant: 'destructive', title: 'URL is required' });
      return;
    }
    try { new URL(trimmedUrl); } catch {
      toast({ variant: 'destructive', title: 'Invalid URL', description: 'Please enter a valid URL starting with http:// or https://' });
      return;
    }

    setIsCreating(true);
    try {
      const code = customCode.trim() || generateCode(6);

      if (customCode.trim() && !/^[a-z0-9-_]{3,32}$/.test(code)) {
        toast({ variant: 'destructive', title: 'Invalid code', description: 'Custom codes may only contain lowercase letters, numbers, hyphens and underscores (3–32 chars).' });
        setIsCreating(false);
        return;
      }
      
      const privateLinkRef = doc(firestore, 'short_links', code);
      const publicLinkRef = doc(firestore, 'short_link_public', code);

      const existing = await getDoc(publicLinkRef);
      if (existing.exists()) {
        toast({ variant: 'destructive', title: 'Code taken', description: `The code "${code}" is already in use. Try a different one.` });
        setIsCreating(false);
        return;
      }

      const batch = writeBatch(firestore);

      batch.set(privateLinkRef, {
        code,
        originalUrl: trimmedUrl,
        title: newTitle.trim() || trimmedUrl,
        ownerId: user.uid,
        clickCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      batch.set(publicLinkRef, {
        originalUrl: trimmedUrl,
        clickCount: 0
      });
      
      await batch.commit();

      toast({ title: 'Short link created!', description: `${siteUrl}/s/${code}` });
      setNewUrl('');
      setNewTitle('');
      setCustomCode('');
    } catch (err: any) {
      console.error('Short link creation failed', {
        message: err?.message,
        errorCode: err?.code,
        userId: user?.uid,
        ownerId: user?.uid,
        customCode: customCode.trim() || 'auto-generated',
        originalUrl: trimmedUrl,
      });
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Could not create link.' });
    } finally {
      setIsCreating(false);
    }
  }, [user, firestore, newUrl, newTitle, customCode, toast]);

  const handleDelete = useCallback(async () => {
    if (!linkToDelete || !firestore) return;
    try {
      const batch = writeBatch(firestore);
      batch.delete(doc(firestore, 'short_links', linkToDelete.code));
      batch.delete(doc(firestore, 'short_link_public', linkToDelete.code));
      await batch.commit();

      toast({ title: 'Link deleted.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setLinkToDelete(null);
    }
  }, [linkToDelete, firestore, toast]);

  const copyToClipboard = (code: string) => {
    const url = `${siteUrl}/s/${code}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Copied!', description: url });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <DashboardNav />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Link2 className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Link Shortener</h1>
        </div>
        <p className="text-muted-foreground mb-8">Create and manage short links for sharing.</p>

        <Alert className="mb-8 border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-200 [&>svg]:text-orange-500">
            <Info className="h-4 w-4" />
            <AlertTitle>Beta Feature</AlertTitle>
            <AlertDescription>
                This feature is currently under development and may not work reliably. Redirects might fail.
            </AlertDescription>
        </Alert>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PlusCircle className="h-5 w-5 text-primary" />
              Create short link
            </CardTitle>
            <CardDescription>Paste any URL to generate a short, shareable link.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-url">Destination URL *</Label>
                <Input
                  id="new-url"
                  placeholder="https://example.com/very/long/url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-title">Title (optional)</Label>
                <Input
                  id="new-title"
                  placeholder="My awesome link"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="space-y-1.5 flex-1 max-w-xs">
                <Label htmlFor="custom-code">Custom code (optional)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{siteUrl}/s/</span>
                  <Input
                    id="custom-code"
                    placeholder="my-code"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.toLowerCase())}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
              <Button onClick={handleCreate} disabled={isCreating || !newUrl.trim()} className="self-end">
                {isCreating ? 'Creating…' : 'Shorten'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Your links</h2>
            <p className="text-muted-foreground">Search, copy, and delete your short links.</p>
          </div>
          <div className="w-full sm:w-80">
            <Label htmlFor="link-search" className="sr-only">Search links</Label>
            <Input
              id="link-search"
              placeholder="Search by title, URL, or code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isUserLoading || isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No links yet</h3>
            <p className="text-muted-foreground mt-2">Create your first short link above.</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <h3 className="text-lg font-semibold">No matching links</h3>
            <p className="text-muted-foreground mt-2">Try a different keyword or clear the search.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLinks.map((link) => (
              <ShortLinkItem
                key={link.id}
                link={link}
                siteUrl={siteUrl}
                onCopy={() => copyToClipboard(link.code)}
                onDelete={() => setLinkToDelete(link)}
              />
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!linkToDelete} onOpenChange={(open) => !open && setLinkToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete short link?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>/s/{linkToDelete?.code}</strong> and all its click data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
