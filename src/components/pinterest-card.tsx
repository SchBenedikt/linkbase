'use client';

import { useEffect } from 'react';
import { GripVertical, MoreVertical, Trash2, Edit } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface PinterestCardProps {
  link: Link;
  appearance: AppearanceSettings;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

/** Extracts a Pinterest pin ID from a pin URL */
function extractPinId(url: string): string | null {
  const m = url.match(/pinterest\.[a-z]+(?:\.[a-z]+)*\/pin\/(\d+)/i);
  return m ? m[1] : null;
}

function PinterestWidgetLoader() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const win = window as any;
    if (!win.PinUtils) {
      const existing = document.querySelector('script[src*="pinit.js"]');
      if (!existing) {
        const script = document.createElement('script');
        script.src = 'https://assets.pinterest.com/js/pinit.js';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    } else {
      try { win.PinUtils?.build(); } catch (e) {
        // build() may fail if no pins are present yet; safe to ignore
        console.debug('PinUtils.build failed:', e);
      }
    }
  }, []);
  return null;
}

export function PinterestCard({ link, appearance, onEdit, onDelete, isEditable = false, dragHandleListeners }: PinterestCardProps) {
  const pinId = link.url ? extractPinId(link.url) : null;

  const cardStyle: React.CSSProperties = {
    borderWidth: `${appearance.borderWidth || 0}px`,
    borderColor: appearance.borderColor,
    borderStyle: appearance.borderWidth ? 'solid' : 'none',
    overflow: 'hidden',
  };

  return (
    <Card className="group relative w-full h-full bg-card overflow-hidden" style={cardStyle}>
      {pinId ? (
        <div className="w-full h-full overflow-auto flex items-center justify-center p-2">
          <a
            data-pin-do="embedPin"
            data-pin-width="large"
            href={link.url || '#'}
          />
          <PinterestWidgetLoader />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center p-4 text-sm text-muted-foreground text-center">
          <a
            href={link.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-primary"
          >
            {link.title || link.url || 'Pinterest Pin'}
          </a>
        </div>
      )}

      {isEditable && onEdit && onDelete && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="ghost" size="icon" className="h-9 w-9 cursor-grab bg-black/30 hover:bg-black/50 text-white hover:text-white" aria-label="Reorder" {...dragHandleListeners}>
            <GripVertical className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-black/30 hover:bg-black/50 text-white hover:text-white" aria-label="Options">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}><Edit className="mr-2 h-4 w-4" /><span>Edit</span></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /><span>Delete</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </Card>
  );
}
