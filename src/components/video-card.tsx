'use client';

import { GripVertical, MoreVertical, Trash2, Edit, Play } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface VideoCardProps {
  link: Link;
  onEdit?: () => void;
  onDelete?: () => void;
  appearance: AppearanceSettings;
  isEditable?: boolean;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

export function VideoCard({ link, onEdit, onDelete, appearance, isEditable = false, dragHandleListeners }: VideoCardProps) {
  const cardStyle: React.CSSProperties = {
    borderWidth: `${appearance.borderWidth || 0}px`,
    borderColor: appearance.borderColor,
    borderStyle: appearance.borderWidth ? 'solid' : 'none',
  };

  const textStyle: React.CSSProperties = {
    color: appearance.cardForegroundColor || '#FFFFFF',
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 ease-in-out bg-card flex flex-col w-full h-full" style={cardStyle}>
      <div className="relative flex-grow bg-black flex items-center justify-center">
        {link.url ? (
          <video
            src={link.url}
            controls
            className="absolute inset-0 w-full h-full object-contain"
            preload="metadata"
            playsInline
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Play className="h-10 w-10" />
            <span className="text-xs">No video URL</span>
          </div>
        )}
      </div>
      {link.title && (
        <div className="p-3">
          <h3 className="font-headline font-bold text-sm truncate" style={textStyle}>{link.title}</h3>
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
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" /><span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" /><span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </Card>
  );
}
