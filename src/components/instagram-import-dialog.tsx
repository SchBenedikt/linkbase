'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Instagram, Loader2, Download } from 'lucide-react';

interface InstagramImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (posts: ImportedPost[]) => void;
}

export interface ImportedPost {
  url: string;
  title: string;
  type: 'instagram';
  colSpan: number;
  rowSpan: number;
}

function extractInstagramPostId(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

function isValidInstagramUrl(url: string): boolean {
  return /instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+/.test(url);
}

export function InstagramImportDialog({
  open,
  onOpenChange,
  onImport,
}: InstagramImportDialogProps) {
  const { toast } = useToast();
  const [rawInput, setRawInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    const urls = rawInput
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    if (urls.length === 0) {
      toast({ variant: 'destructive', title: 'No URLs', description: 'Please paste at least one Instagram post or reel URL.' });
      return;
    }

    const valid = urls.filter(isValidInstagramUrl);
    const invalid = urls.length - valid.length;

    if (valid.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No valid URLs',
        description: 'None of the entered URLs are valid Instagram post or reel links.',
      });
      return;
    }

    setIsImporting(true);
    try {
      const posts: ImportedPost[] = valid.map((url) => {
        const postId = extractInstagramPostId(url);
        return {
          url,
          title: `Instagram Post${postId ? ` (${postId.slice(0, 6)}…)` : ''}`,
          type: 'instagram' as const,
          colSpan: 2,
          rowSpan: 2,
        };
      });

      onImport(posts);
      setRawInput('');
      onOpenChange(false);

      const msg =
        invalid > 0
          ? `Imported ${posts.length} post${posts.length !== 1 ? 's' : ''}. ${invalid} URL${invalid !== 1 ? 's were' : ' was'} invalid and skipped.`
          : `Imported ${posts.length} Instagram post${posts.length !== 1 ? 's' : ''}.`;

      toast({ title: 'Import successful', description: msg });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Import Instagram Posts
          </DialogTitle>
          <DialogDescription>
            Paste one or more Instagram post or reel URLs (one per line) to add them as embedded cards to your page.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="instagram-urls">Post / Reel URLs</Label>
            <textarea
              id="instagram-urls"
              className="w-full min-h-[120px] resize-y rounded-md border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={`https://www.instagram.com/p/ABC123/\nhttps://www.instagram.com/reel/XYZ456/`}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Supports post URLs (<code>/p/…</code>) and reel URLs (<code>/reel/…</code>).
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isImporting || !rawInput.trim()}>
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing…
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Import Posts
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
