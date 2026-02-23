'use client';

import { GripVertical, MoreVertical, Trash2, Edit, Heart } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface DonationCardProps {
  link: Link;
  appearance: AppearanceSettings;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

export function DonationCard({ link, appearance, onEdit, onDelete, isEditable = false, dragHandleListeners }: DonationCardProps) {
  const cardStyle: React.CSSProperties = {
    borderWidth: `${appearance.borderWidth || 0}px`,
    borderColor: appearance.borderColor,
    borderStyle: appearance.borderWidth ? 'solid' : 'none',
  };

  const buttonLabel = link.donationButtonText || 'Support me';

  return (
    <Card className="group relative overflow-hidden bg-card w-full h-full flex flex-col" style={cardStyle}>
      <CardContent className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
        <Heart className="h-10 w-10 text-rose-500" fill="currentColor" />
        {link.title && (
          <h3 className="font-bold text-lg text-card-foreground leading-tight">{link.title}</h3>
        )}
        {link.content && (
          <p className="text-sm text-muted-foreground">{link.content}</p>
        )}
        {link.url && (
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-opacity hover:opacity-90 active:scale-95"
            style={{
              background: appearance.primaryColor || 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
            }}
          >
            <Heart className="h-4 w-4" />
            {buttonLabel}
          </a>
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
