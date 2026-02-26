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
import { Badge } from '@/components/ui/badge';
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

  const linksQuery = useMemoFirebase(() =>
    user && firestore ? query(collection(firestore!, 'shortLinks'), where('ownerId', '==', user.uid)) : null,
    [user, firestore]
  );
  const { data: links, isLoading: areLinksLoading } = useCollection<ShortLink>(linksQuery);

  const filteredLinks = useMemo(() => {
    if (!links) return [];
    return links.filter(link =>
      link.title?.toLowerCase().includes(search.toLowerCase()) ||
      link.code.toLowerCase().includes(search.toLowerCase()) ||
      link.originalUrl.toLowerCase().includes(search.toLowerCase())
    );
  }, [links, search]);


  const handleCreate = async () => {
    if (!newUrl.trim() || !user || !firestore) return;

    setIsCreating(true);
    try {
      const { doc, setDoc, collection } = await import('firebase/firestore');
      
      const code = customCode.trim() || generateCode();
      const shortLinkRef = doc(collection(firestore!, 'shortLinks'), code);
      
      await setDoc(shortLinkRef, {
        id: code,
        code,
        originalUrl: newUrl.trim(),
        title: newTitle.trim() || 'Untitled Link',
        ownerId: user.uid,
        clickCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setNewUrl('');
      setNewTitle('');
      setCustomCode('');
      toast({ title: 'Success!', description: `Short link /s/${code} created.` });
    } catch (error: any) {
      console.error('Error creating short link:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to create link.' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = useCallback(async () => {
    if (!linkToDelete || !firestore) return;

    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(firestore!, 'shortLinks', linkToDelete.id));
      toast({ title: 'Deleted!', description: `Short link /s/${linkToDelete.code} has been removed.` });
    } catch (error: any) {
      console.error('Error deleting short link:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete link.' });
    } finally {
      setLinkToDelete(null);
    }
  }, [linkToDelete, firestore, toast]);

  const copyToClipboard = (code: string) => {
    const url = `${siteUrl}/s/${code}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Copied!', description: url });
  };

  const isLoading = isUserLoading || areLinksLoading;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground border-b sticky top-0 z-50">
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
          <h1 className="text-3xl font-bold tracking-tight">Short Links</h1>
          <Badge variant="secondary" className="text-sm">
            {filteredLinks.length} links
          </Badge>
        </div>



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
                <Label htmlFor="url">Destination URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/very/long/url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  placeholder="My Link"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code">Custom code (optional)</Label>
              <Input
                id="code"
                placeholder="custom-code"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for random code. Only lowercase letters, numbers, and hyphens allowed.
              </p>
            </div>
            <Button 
              onClick={handleCreate} 
              disabled={!newUrl.trim() || isCreating}
              className="w-full sm:w-auto"
            >
              {isCreating ? (
                <>
                  <PlusCircle className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Link
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredLinks.length > 0 ? (
          <div className="space-y-4">
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
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No short links yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first short link to get started.
              </p>
              <Button onClick={() => document.getElementById('url')?.focus()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Link
              </Button>
            </CardContent>
          </Card>
        )}

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
      </main>
    </div>
  );
}
