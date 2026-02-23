'use client';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { ShortLink, ShortLinkPublic } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Trash2, BarChart2 } from 'lucide-react';
import { format } from 'date-fns';

export function ShortLinkItem({ link, onCopy, onDelete }: {
    link: ShortLink,
    onCopy: () => void,
    onDelete: () => void,
}) {
    const firestore = useFirestore();
    const publicLinkRef = useMemoFirebase(
        () => firestore ? doc(firestore, 'short_link_public', link.code) : null,
        [firestore, link.code]
    );
    const { data: publicData } = useDoc<ShortLinkPublic>(publicLinkRef);

    // Use the public click count if available, otherwise fall back to the (potentially stale) private one.
    const clickCount = publicData?.clickCount ?? link.clickCount ?? 0;
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
                /s/{link.code}
              </button>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{link.title || link.originalUrl}</p>
              <p className="text-xs text-muted-foreground/60 truncate">{link.originalUrl}</p>
              {createdDate && <p className="text-xs text-muted-foreground/50 mt-0.5">{createdDate}</p>}
            </div>

            <div className="flex-shrink-0 flex flex-col items-center gap-1 min-w-[60px]">
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-bold">{(clickCount || 0).toLocaleString()}</span>
              <span className="text-[10px] text-muted-foreground">clicks</span>
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
