'use client';

import { useState } from 'react';
import { GripVertical, MoreVertical, Trash2, Edit, ChevronDown } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface FaqCardProps {
  link: Link;
  appearance: AppearanceSettings;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

export type FaqItem = {
  question: string;
  answer: string;
};

function parseFaqItems(content?: string): FaqItem[] {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed as FaqItem[];
    return [];
  } catch {
    return [];
  }
}

export function FaqCard({ link, appearance, onEdit, onDelete, isEditable = false, dragHandleListeners }: FaqCardProps) {
  const items = parseFaqItems(link.content);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
  const mutedStyle: React.CSSProperties = { color: appearance.cardForegroundColor || '#111827', opacity: 0.65 };
  const dividerStyle: React.CSSProperties = { borderColor: appearance.borderColor || '#e5e7eb', opacity: 0.5 };

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 ease-in-out bg-card w-full h-full flex flex-col p-4 gap-0"
      style={cardStyle}
    >
      {link.title && (
        <p className="text-sm font-bold mb-3 truncate" style={textStyle}>{link.title}</p>
      )}

      {items.length === 0 ? (
        <p className="text-xs text-center py-4" style={mutedStyle}>No FAQ items yet.</p>
      ) : (
        <div className="flex flex-col divide-y overflow-auto" style={dividerStyle}>
          {items.map((item, i) => (
            <div key={i} className="py-2.5">
              <button
                type="button"
                className="flex items-center justify-between w-full text-left gap-2 group/item"
                onClick={() => toggle(i)}
              >
                <span className="text-sm font-medium leading-snug" style={textStyle}>{item.question}</span>
                <ChevronDown
                  className={cn('h-4 w-4 flex-shrink-0 transition-transform duration-200', openIndex === i && 'rotate-180')}
                  style={mutedStyle}
                />
              </button>
              {openIndex === i && (
                <p className="mt-2 text-sm leading-relaxed" style={mutedStyle}>{item.answer}</p>
              )}
            </div>
          ))}
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
