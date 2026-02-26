'use client';

import { GripVertical, MoreVertical, Trash2, Edit } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface TwitchCardProps {
  link: Link;
  appearance: AppearanceSettings;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

/** Extracts the channel name from a twitch.tv URL */
function extractChannel(url: string): string | null {
  const m = url.match(/(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)/i);
  return m ? m[1] : null;
}

export function TwitchCard({ link, appearance, onEdit, onDelete, isEditable = false, dragHandleListeners }: TwitchCardProps) {
  const channel = link.url ? extractChannel(link.url) : null;
  const parentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  const cardStyle: React.CSSProperties = {
    borderWidth: `${appearance.borderWidth || 0}px`,
    borderColor: appearance.borderColor,
    borderStyle: appearance.borderWidth ? 'solid' : 'none',
    overflow: 'hidden',
  };

  return (
    <Card className="group relative w-full h-full bg-card overflow-hidden" style={cardStyle}>
      {channel ? (
        <iframe
          src={`https://player.twitch.tv/?channel=${channel}&parent=${parentHost}&muted=true`}
          title={link.title || `${channel} on Twitch`}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="w-full h-full border-0"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-4 text-sm text-muted-foreground text-center">
          <a
            href={link.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            {link.title || link.url || 'Twitch Channel'}
          </a>
        </div>
      )}

      {isEditable && onEdit && onDelete && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 transition-opacity duration-300">
          <Button variant="ghost" size="icon" className="h-9 w-9 cursor-grab bg-black/30 text-white" aria-label="Reorder" {...dragHandleListeners}>
            <GripVertical className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-black/30 text-white" aria-label="Options">
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
