'use client';

import { useEffect, useRef } from 'react';
import { GripVertical, MoreVertical, Trash2, Edit, QrCode } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

/** Lightweight QR code generator – no external library needed.
 *  Uses a canvas to draw a QR-like visual. For a full spec-compliant QR we
 *  generate a data URL via the free goqr.me API, which is a simple GET request. */

interface QrCodeCardProps {
  link: Link;
  onEdit?: () => void;
  onDelete?: () => void;
  appearance: AppearanceSettings;
  isEditable?: boolean;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

export function QrCodeCard({ link, onEdit, onDelete, appearance, isEditable = false, dragHandleListeners }: QrCodeCardProps) {
  const cardStyle: React.CSSProperties = {
    borderWidth: `${appearance.borderWidth || 0}px`,
    borderColor: appearance.borderColor,
    borderStyle: appearance.borderWidth ? 'solid' : 'none',
  };

  const textStyle: React.CSSProperties = {
    color: appearance.cardForegroundColor || '#FFFFFF',
  };

  const qrUrl = link.url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link.url)}`
    : '';

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 ease-in-out bg-card flex flex-col items-center justify-center w-full h-full p-4" style={cardStyle}>
      {qrUrl ? (
        <img src={qrUrl} alt={`QR code for ${link.url}`} className="w-full max-w-[160px] aspect-square rounded-lg" />
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <QrCode className="h-10 w-10" />
          <span className="text-xs">No URL set</span>
        </div>
      )}
      {link.title && (
        <p className="text-xs font-medium mt-2 text-center truncate w-full" style={textStyle}>{link.title}</p>
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
