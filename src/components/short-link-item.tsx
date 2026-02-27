'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import type { ShortLink } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Copy, ExternalLink, Trash2, Edit2, Check, Loader2,
  QrCode, Power, MousePointerClick,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export function ShortLinkItem({ link, siteUrl, onCopy, onDelete, onEdit, onToggleActive }: {
    link: ShortLink,
    siteUrl: string,
    onCopy: () => void,
    onDelete: () => void,
    onEdit?: (id: string, data: { title: string; originalUrl: string }) => Promise<void>,
    onToggleActive?: (id: string, isActive: boolean) => Promise<void>,
}) {
    const createdDate = link.createdAt?.toDate ? format(link.createdAt.toDate(), 'MMM d, yyyy') : '';
    const isActive = link.isActive !== false; // treat missing field as active
    const shortUrl = `${siteUrl}/s/${link.code}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(shortUrl)}&format=png&margin=4`;

    const [editOpen, setEditOpen] = useState(false);
    const [qrOpen, setQrOpen] = useState(false);
    const [editTitle, setEditTitle] = useState(link.title || '');
    const [editUrl, setEditUrl] = useState(link.originalUrl);
    const [isSaving, setIsSaving] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

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

    const handleToggle = async () => {
        if (!onToggleActive) return;
        setIsToggling(true);
        try {
            await onToggleActive(link.id, !isActive);
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <>
            <Card className={cn("shadow-none border", !isActive && "opacity-60")}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      className="font-mono text-primary font-semibold text-sm truncate block text-left"
                      onClick={onCopy}
                      title="Click to copy"
                    >
                      {siteUrl.replace(/^https?:\/\//, '')}/s/{link.code}
                    </button>
                    {!isActive && (
                      <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium shrink-0">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{link.title || link.originalUrl}</p>
                  <p className="text-xs text-muted-foreground/60 truncate">{link.originalUrl}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {createdDate && (
                      <p className="text-xs text-muted-foreground/50">{createdDate}</p>
                    )}
                    {typeof link.clickCount === 'number' && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MousePointerClick className="h-3 w-3" />
                        {link.clickCount.toLocaleString()} {link.clickCount === 1 ? 'click' : 'clicks'}
                      </span>
                    )}
                  </div>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Show QR code"
                    onClick={() => setQrOpen(true)}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                  {onToggleActive && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title={isActive ? 'Disable link' : 'Enable link'}
                      onClick={handleToggle}
                      disabled={isToggling}
                      className={isActive ? 'text-primary' : 'text-muted-foreground'}
                    >
                      {isToggling
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Power className="h-4 w-4" />
                      }
                    </Button>
                  )}
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

            {/* Edit dialog */}
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

            {/* QR code dialog */}
            <Dialog open={qrOpen} onOpenChange={setQrOpen}>
                <DialogContent className="max-w-xs">
                    <DialogHeader>
                        <DialogTitle>QR Code</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={qrApiUrl}
                            alt={`QR code for ${shortUrl}`}
                            width={256}
                            height={256}
                            className="rounded-lg border"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).insertAdjacentHTML(
                                    'afterend',
                                    '<p class="text-sm text-muted-foreground py-8">Could not load QR code. Please try again.</p>'
                                );
                            }}
                        />
                        <p className="text-xs font-mono text-muted-foreground break-all text-center">{shortUrl}</p>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button size="sm" variant="outline" asChild className="flex-1">
                            <a href={qrApiUrl} target="_blank" rel="noopener noreferrer">
                                Open full size
                            </a>
                        </Button>
                        <Button size="sm" onClick={() => setQrOpen(false)} className="flex-1">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

