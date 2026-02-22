'use client';

import { useState, useEffect } from 'react';
import { MoreVertical, Trash2, Edit, GripVertical } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface ClockCardProps {
  link: Link;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  appearance: AppearanceSettings;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

export function ClockCard({ link, onEdit, onDelete, isEditable = false, appearance, dragHandleListeners }: ClockCardProps) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState('');
  const [offset, setOffset] = useState('');

  const timezone = link.timezone || 'UTC';

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      const tzOffset = new Intl.DateTimeFormat('en', {
        timeZoneName: 'shortOffset',
        timeZone: timezone,
      })
        .formatToParts(now)
        .find((p) => p.type === 'timeZoneName')?.value || '';
      setOffset(tzOffset);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  const cardStyle: React.CSSProperties = {
    borderWidth: `${appearance.borderWidth || 0}px`,
    borderColor: appearance.borderColor,
    borderStyle: appearance.borderWidth ? 'solid' : 'none',
    backgroundColor: appearance.cardColor,
  };

  if (!appearance.borderWidth) {
    cardStyle.borderWidth = '0px';
  }

  const textStyle: React.CSSProperties = { color: appearance.cardForegroundColor || '#111827' };
  const mutedStyle: React.CSSProperties = { color: appearance.cardForegroundColor || '#111827', opacity: 0.6 };

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 ease-in-out bg-card w-full h-full flex flex-col items-center justify-center p-4"
      style={cardStyle}
    >
      {mounted ? (
        <>
          <p className="text-3xl font-bold font-mono tracking-tight" style={textStyle}>{time}</p>
          <p className="text-sm font-semibold mt-1 truncate max-w-full" style={textStyle}>{link.title}</p>
          <p className="text-xs mt-0.5" style={mutedStyle}>{offset}</p>
        </>
      ) : (
        <p className="text-3xl font-bold font-mono tracking-tight" style={textStyle}>--:--:--</p>
      )}

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
