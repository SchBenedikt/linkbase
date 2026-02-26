'use client';

import { useState, useEffect } from 'react';
import { MoreVertical, Trash2, Edit, GripVertical } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface CountdownCardProps {
  link: Link;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  appearance: AppearanceSettings;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

function getTimeLeft(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

export function CountdownCard({ link, onEdit, onDelete, isEditable = false, appearance, dragHandleListeners }: CountdownCardProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!link.countdownTarget) return;
    const tick = () => setTimeLeft(getTimeLeft(link.countdownTarget!));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [link.countdownTarget]);

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

  const UnitBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-2xl font-bold font-mono leading-none" style={textStyle}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-xs uppercase tracking-wider" style={mutedStyle}>{label}</span>
    </div>
  );

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 ease-in-out bg-card w-full h-full flex flex-col items-center justify-center gap-2 p-4"
      style={cardStyle}
    >
      {link.title && (
        <p className="text-sm font-semibold truncate max-w-full mb-1" style={textStyle}>{link.title}</p>
      )}
      {!mounted ? (
        <p className="text-lg font-mono" style={textStyle}>Loading...</p>
      ) : !link.countdownTarget || timeLeft === null ? (
        <p className="text-2xl" style={textStyle}>🎉 Time&apos;s up!</p>
      ) : (
        <div className="grid grid-cols-4 gap-3 w-full">
          <UnitBox value={timeLeft.days} label="days" />
          <UnitBox value={timeLeft.hours} label="hrs" />
          <UnitBox value={timeLeft.minutes} label="mins" />
          <UnitBox value={timeLeft.seconds} label="secs" />
        </div>
      )}

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
