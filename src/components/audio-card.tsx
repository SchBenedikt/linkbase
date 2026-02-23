'use client';

import { GripVertical, MoreVertical, Trash2, Edit, Music } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface AudioCardProps {
  link: Link;
  appearance: AppearanceSettings;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

export function AudioCard({ link, appearance, onEdit, onDelete, isEditable = false, dragHandleListeners }: AudioCardProps) {
  const cardStyle: React.CSSProperties = {
    borderWidth: `${appearance.borderWidth || 0}px`,
    borderColor: appearance.borderColor,
    borderStyle: appearance.borderWidth ? 'solid' : 'none',
  };

  const fgStyle: React.CSSProperties = { color: appearance.cardForegroundColor };
  const mutedStyle: React.CSSProperties = { color: appearance.cardForegroundColor, opacity: 0.7 };

  const audioSrc = link.audioUrl || link.url;

  return (
    <Card className="group relative overflow-hidden bg-card w-full h-full flex flex-col" style={cardStyle}>
      <CardContent className="flex flex-col justify-center gap-3 h-full p-5">
        <div className="flex items-center gap-3">
          {link.thumbnailUrl ? (
            <img
              src={link.thumbnailUrl}
              alt={link.title}
              className="h-12 w-12 rounded-md object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-12 w-12 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: appearance.primaryColor || 'hsl(var(--primary))' }}>
              <Music className="h-6 w-6 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate" style={fgStyle}>{link.title}</p>
            {link.content && <p className="text-xs truncate" style={mutedStyle}>{link.content}</p>}
          </div>
        </div>
        {audioSrc && (
          <audio
            controls
            className="w-full mt-2"
            style={{ colorScheme: 'auto' }}
            preload="metadata"
          >
            <source src={audioSrc} />
            <track kind="captions" />
            Your browser does not support the audio element. To listen to &ldquo;{link.title}&rdquo;,{' '}
            <a href={audioSrc} target="_blank" rel="noopener noreferrer">click here</a>.
          </audio>
        )}
      </CardContent>

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
