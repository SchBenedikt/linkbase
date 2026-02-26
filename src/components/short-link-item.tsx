'use client';
import { format } from 'date-fns';
import type { ShortLink } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Trash2 } from 'lucide-react';

export function ShortLinkItem({ link, siteUrl, onCopy, onDelete }: {
    link: ShortLink,
    siteUrl: string,
    onCopy: () => void,
    onDelete: () => void,
}) {
    const createdDate = link.createdAt?.toDate ? format(link.createdAt.toDate(), 'MMM d, yyyy') : '';

    return (
        <Card className="shadow-none border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <button
                className="font-mono text-primary font-semibold text-sm hover:underline truncate block text-left"
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
              <Button variant="ghost" size="icon" title="Delete" onClick={onDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
    );
}
