'use client';

import { GripVertical, MoreVertical, Trash2, Edit, Minus } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface HeaderCardProps {
  link: Link;
  onEdit?: () => void;
  onDelete?: () => void;
  appearance: AppearanceSettings;
  isEditable?: boolean;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

export function HeaderCard({ link, onEdit, onDelete, appearance, isEditable = false, dragHandleListeners }: HeaderCardProps) {
  const textStyle: React.CSSProperties = {
    color: appearance.foregroundColor,
  };

  return (
    <Card
      className="group relative bg-transparent shadow-none border-none flex flex-col items-center justify-center w-full h-full px-4"
    >
      {link.title && (
        <h2 className="font-headline font-bold text-lg tracking-wide uppercase text-center" style={textStyle}>
          {link.title}
        </h2>
      )}
      <div className="w-full flex items-center gap-3 mt-2">
        <div className="flex-1 h-px" style={{ backgroundColor: appearance.foregroundColor, opacity: 0.2 }} />
        <Minus className="h-3 w-3" style={{ color: appearance.foregroundColor, opacity: 0.3 }} />
        <div className="flex-1 h-px" style={{ backgroundColor: appearance.foregroundColor, opacity: 0.2 }} />
      </div>

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
