'use client';

import { GripVertical, MoreVertical, Trash2, Edit } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TextCardProps {
  link: Link;
  onEdit?: () => void;
  onDelete?: () => void;
  appearance: AppearanceSettings;
  isEditable?: boolean;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

export function TextCard({ link, onEdit, onDelete, appearance, isEditable = false, dragHandleListeners }: TextCardProps) {
  const isTransparent = link.hasTransparentBackground;
  
  const cardStyle: React.CSSProperties = !isTransparent ? {
    borderWidth: `${appearance.borderWidth || 0}px`,
    borderColor: appearance.borderColor,
    borderStyle: appearance.borderWidth ? 'solid' : 'none',
  } : {};

  const textStyle: React.CSSProperties = {
      color: isTransparent ? appearance.foregroundColor : appearance.cardForegroundColor
  };
  
  return (
    <Card 
        className={cn(
          "group relative transition-all duration-300 ease-in-out flex flex-col w-full h-full p-5",
          isTransparent ? "bg-transparent shadow-none border-none" : "bg-card overflow-hidden"
        )}
        style={cardStyle}
    >
        <h3 className="font-headline font-bold text-xl mb-2" style={textStyle}>{link.title}</h3>
        <p className="text-sm flex-grow whitespace-pre-wrap" style={textStyle}>
          {link.content}
        </p>

        {isEditable && onEdit && onDelete && (
            <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button variant="ghost" size="icon" className="h-9 w-9 cursor-grab bg-black/30 hover:bg-black/50 text-white hover:text-white" aria-label="Reorder link" {...dragHandleListeners}>
                    <GripVertical className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 bg-black/30 hover:bg-black/50 text-white hover:text-white" aria-label="Link options">
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
