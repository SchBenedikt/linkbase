'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import type { ShortLink } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, ExternalLink, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export function ShortLinkItem({ link, siteUrl, onCopy, onDelete, onEdit }: {
    link: ShortLink,
    siteUrl: string,
    onCopy: () => void,
    onDelete: () => void,
    onEdit?: (id: string, data: { title: string; originalUrl: string }) => Promise<void>,
}) {
    const createdDate = link.createdAt?.toDate ? format(link.createdAt.toDate(), 'MMM d, yyyy') : '';
    const [editOpen, setEditOpen] = useState(false);
    const [editTitle, setEditTitle] = useState(link.title || '');
    const [editUrl, setEditUrl] = useState(link.originalUrl);
    const [isSaving, setIsSaving] = useState(false);

    const handleEditSave = async () => {
        if (!onEdit || !editUrl.trim()) return;
        setIsSaving(true);
        try {
            await onEdit(link.id, { title: editTitle.trim(), originalUrl: editUrl.trim() });
            setEditOpen(false);
        } catch {
            // error toast is handled by the caller (onEdit)
        } finally {
            setIsSaving(false);
        }
    };

    const openEdit = () => {
        setEditTitle(link.title || '');
        setEditUrl(link.originalUrl);
        setEditOpen(true);
    };

    return (
        <>
            <Card className="shadow-none border">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <button
                    className="font-mono text-primary font-semibold text-sm truncate block text-left"
                    onClick={onCopy}
                    title="Click to copy"
                  >
                    {siteUrl.replace(/^https?:\/\//, '')}/s/{link.code}
                  </button>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{link.title || link.originalUrl}</p>
                  <p className="text-xs text-muted-foreground/60 truncate">{link.originalUrl}</p>
                  {createdDate && <p className="text-xs text-muted-foreground/50 mt-0.5">{createdDate}</p>}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" title="Copy short URL" onClick={onCopy}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Open original URL" asChild>
                    <a href={link.originalUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  {onEdit && (
                    <Button variant="ghost" size="icon" title="Edit" onClick={openEdit}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" title="Delete" onClick={onDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Short Link</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Link title"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-url">Destination URL</Label>
                            <Input
                                id="edit-url"
                                type="url"
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                placeholder="https://example.com"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Short code: <span className="font-mono font-semibold">/s/{link.code}</span> (cannot be changed)
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditSave} disabled={isSaving || !editUrl.trim()}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
