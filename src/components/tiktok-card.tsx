'use client';

import { MoreVertical, Trash2, Edit, GripVertical } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { LinkCard } from './link-card';

interface TiktokCardProps {
  link: Link;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  appearance: AppearanceSettings;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

export function TiktokCard({ link, onEdit, onDelete, isEditable = false, appearance, dragHandleListeners }: TiktokCardProps) {
  const getTiktokVideoId = (url: string): string | null => {
    const match = url.match(/video\/(\d+)/);
    return match ? match[1] : null;
  };

  const videoId = link.url ? getTiktokVideoId(link.url) : null;

  if (!videoId) {
    return (
      <LinkCard
        link={link}
        onEdit={onEdit}
        onDelete={onDelete}
        appearance={appearance}
        isEditable={isEditable}
        dragHandleListeners={dragHandleListeners}
      />
    );
  }

  const embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;

  const cardStyle: React.CSSProperties = {
    borderWidth: `${appearance.borderWidth || 0}px`,
    borderColor: appearance.borderColor,
    borderStyle: appearance.borderWidth ? 'solid' : 'none',
    backgroundColor: appearance.cardColor,
    display: 'flex',
  };

  if (!appearance.borderWidth) {
    cardStyle.borderWidth = '0px';
  }

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 ease-in-out bg-card w-full h-full"
      style={cardStyle}
    >
      <iframe
        title={`TikTok Embed: ${link.title}`}
        src={embedUrl}
        width="100%"
        height="100%"
        allowFullScreen
        loading="lazy"
        className="flex-grow"
        style={{ border: 'none' }}
      ></iframe>

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
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </Card>
  );
}
