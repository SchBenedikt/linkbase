'use client';

import { GripVertical, MoreVertical, Trash2, Edit, Star } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface TestimonialCardProps {
  link: Link;
  appearance: AppearanceSettings;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

export type TestimonialData = {
  quote: string;
  name: string;
  role?: string;
  avatarUrl?: string;
  rating?: number; // 1-5
};

function parseTestimonial(content?: string): TestimonialData | null {
  if (!content) return null;
  try {
    return JSON.parse(content) as TestimonialData;
  } catch {
    return null;
  }
}

export function TestimonialCard({ link, appearance, onEdit, onDelete, isEditable = false, dragHandleListeners }: TestimonialCardProps) {
  const data = parseTestimonial(link.content);

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

  const rating = data?.rating ?? 5;

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 ease-in-out bg-card w-full h-full flex flex-col justify-between p-5 gap-3"
      style={cardStyle}
    >
      {/* Stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4"
            style={{
              fill: i < rating ? (appearance.primaryColor || '#6366f1') : 'transparent',
              color: appearance.primaryColor || '#6366f1',
            }}
          />
        ))}
      </div>

      {/* Quote */}
      <p className="text-sm leading-relaxed flex-1 line-clamp-6" style={textStyle}>
        &ldquo;{data?.quote || 'Add your testimonial text.'}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 mt-auto">
        {data?.avatarUrl ? (
          <img
            src={data.avatarUrl}
            alt={data.name || 'Author'}
            className="h-9 w-9 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: appearance.primaryColor || '#6366f1', color: '#fff' }}
          >
            {(data?.name || 'A').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={textStyle}>{data?.name || 'Name'}</p>
          {data?.role && (
            <p className="text-xs truncate" style={mutedStyle}>{data.role}</p>
          )}
        </div>
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
