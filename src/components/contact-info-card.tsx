'use client';

import { GripVertical, MoreVertical, Trash2, Edit, Mail, Phone, ArrowRight } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface ContactInfoCardProps {
  link: Link;
  appearance: AppearanceSettings;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

export function ContactInfoCard({ link, appearance, onEdit, onDelete, isEditable = false, dragHandleListeners }: ContactInfoCardProps) {
  const cardStyle: React.CSSProperties = {
    borderWidth: `${appearance.borderWidth || 0}px`,
    borderColor: appearance.borderColor,
    borderStyle: appearance.borderWidth ? 'solid' : 'none',
  };

  const fgStyle: React.CSSProperties = { color: appearance.cardForegroundColor };
  const mutedStyle: React.CSSProperties = { color: appearance.cardForegroundColor, opacity: 0.7 };

  return (
    <Card className="group relative overflow-hidden bg-card w-full h-full flex flex-col" style={cardStyle}>
      <CardContent className="flex flex-col justify-center gap-3 h-full p-5">
        {link.title && (
          <h3 className="font-bold text-base" style={fgStyle}>{link.title}</h3>
        )}
        {link.email && (
          <a
            href={`mailto:${link.email}`}
            className="flex items-center gap-2.5 text-sm group/item hover:underline"
            style={mutedStyle}
          >
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{link.email}</span>
            <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
          </a>
        )}
        {link.phone && (
          <a
            href={`tel:${link.phone}`}
            className="flex items-center gap-2.5 text-sm group/item hover:underline"
            style={mutedStyle}
          >
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span>{link.phone}</span>
            <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
          </a>
        )}
        {link.content && (
          <p className="text-xs mt-1" style={mutedStyle}>{link.content}</p>
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
