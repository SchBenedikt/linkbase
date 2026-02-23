'use client';

import { useState, useMemo, useCallback } from 'react';
import { collection, query, where, doc, setDoc, deleteDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Copy, ExternalLink, Link2, PlusCircle, Trash2, BarChart2 } from 'lucide-react';
import type { ShortLink } from '@/lib/types';
import { DashboardNav } from '@/components/dashboard-nav';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { format } from 'date-fns';

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
  || 'https://links.xn--schchner-2za.de';

export default function LinksPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<ShortLink | null>(null);

  const shortLinksQuery = useMemoFirebase(
    () => user && firestore
      ? query(collection(firestore, 'short_links'), where('ownerId', '==', user.uid))
      : null,
    [user, firestore]
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

      // Validate custom code format
      if (customCode.trim() && !/^[a-z0-9-_]{3,32}$/.test(code)) {
        toast({ variant: 'destructive', title: 'Invalid code', description: 'Custom codes may only contain lowercase letters, numbers, hyphens and underscores (3–32 chars).' });
        setIsCreating(false);
        return;
      }

      // Check uniqueness
      const ref = doc(firestore, 'short_links', code);
      const existing = await import('firebase/firestore').then(({ getDoc }) => getDoc(ref));
      if (existing.exists()) {
        toast({ variant: 'destructive', title: 'Code taken', description: `The code "${code}" is already in use. Try a different one.` });
        setIsCreating(false);
        return;
      }

      await setDoc(ref, {
        code,
        originalUrl: trimmedUrl,
        title: newTitle.trim() || trimmedUrl,
        ownerId: user.uid,
        clickCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: 'Short link created!', description: `${siteUrl}/s/${code}` });
      setNewUrl('');
      setNewTitle('');
      setCustomCode('');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Could not create link.' });
    } finally {
      setIsCreating(false);
    }
  }, [user, firestore, newUrl, newTitle, customCode, toast]);

  const handleDelete = useCallback(async () => {
    if (!linkToDelete || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'short_links', linkToDelete.code));
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

  const totalClicks = useMemo(() => links.reduce((s, l) => s + (l.clickCount || 0), 0), [links]);

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
        <div className="flex items-center gap-3 mb-8">
          <Link2 className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Link Shortener</h1>
        </div>

        {/* Summary stats */}
        {links.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Links</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{links.length}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Clicks</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{totalClicks.toLocaleString()}</p></CardContent>
            </Card>
          </div>
        )}

        {/* Create new link */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5" /> Create Short Link</CardTitle>
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
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">/s/</span>
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

        {/* Link list */}
        {isUserLoading || isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No links yet</h3>
            <p className="text-muted-foreground mt-2">Create your first short link above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => {
              const shortUrl = `${siteUrl}/s/${link.code}`;
              const createdDate = link.createdAt?.toDate ? format(link.createdAt.toDate(), 'MMM d, yyyy') : '';
              return (
                <Card key={link.id} className="shadow-none border">
                  <CardContent className="flex items-center gap-4 p-4">
                    {/* Short URL */}
                    <div className="flex-1 min-w-0">
                      <button
                        className="font-mono text-primary font-semibold text-sm hover:underline truncate block"
                        onClick={() => copyToClipboard(link.code)}
                        title="Click to copy"
                      >
                        /s/{link.code}
                      </button>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{link.title || link.originalUrl}</p>
                      <p className="text-xs text-muted-foreground/60 truncate">{link.originalUrl}</p>
                      {createdDate && <p className="text-xs text-muted-foreground/50 mt-0.5">{createdDate}</p>}
                    </div>

                    {/* Clicks badge */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-1 min-w-[60px]">
                      <BarChart2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-bold">{(link.clickCount || 0).toLocaleString()}</span>
                      <span className="text-[10px] text-muted-foreground">clicks</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" title="Copy short URL" onClick={() => copyToClipboard(link.code)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Open original URL" asChild>
                        <a href={link.originalUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => setLinkToDelete(link)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
