'use client';

import { GripVertical, MoreVertical, Trash2, Edit } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface DiscordCardProps {
  link: Link;
  appearance: AppearanceSettings;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

/** Extracts a server ID from a discord.com/widget URL or returns the raw URL if it already looks like a server ID */
function extractServerId(input: string): string | null {
  // discord.com/widget?id=SERVER_ID
  const widgetMatch = input.match(/discord\.com\/widget\?id=(\d+)/i);
  if (widgetMatch) return widgetMatch[1];
  // discord.com/servers/SERVER_ID or discord.gg/invite links won't have the server ID directly
  // Try plain numeric string as fallback
  if (/^\d{17,20}$/.test(input.trim())) return input.trim();
  return null;
}

export function DiscordCard({ link, appearance, onEdit, onDelete, isEditable = false, dragHandleListeners }: DiscordCardProps) {
  const serverId = link.url ? extractServerId(link.url) : null;
  const widgetUrl = serverId
    ? `https://discord.com/widget?id=${serverId}&theme=dark`
    : null;

  const cardStyle: React.CSSProperties = {
    borderWidth: `${appearance.borderWidth || 0}px`,
    borderColor: appearance.borderColor,
    borderStyle: appearance.borderWidth ? 'solid' : 'none',
    overflow: 'hidden',
  };

  return (
    <Card className="group relative w-full h-full bg-card overflow-hidden" style={cardStyle}>
      {widgetUrl ? (
        <iframe
          title={`Discord Widget: ${link.title}`}
          src={widgetUrl}
          width="100%"
          height="100%"
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          loading="lazy"
          style={{ border: 'none' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-4 text-sm text-muted-foreground text-center">
          <a
            href={link.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-primary"
          >
            {link.title || 'Discord Server'}
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
