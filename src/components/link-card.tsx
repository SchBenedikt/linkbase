'use client';

import { GripVertical, MoreVertical, Trash2, Edit, ExternalLink } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { doc, setDoc, increment } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface LinkCardProps {
  link: Link;
  onEdit?: () => void;
  onDelete?: () => void;
  appearance: AppearanceSettings;
  isEditable?: boolean;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

export function LinkCard({ link, onEdit, onDelete, appearance, isEditable = false, dragHandleListeners }: LinkCardProps) {
  const firestore = useFirestore();

  const handleClick = () => {
    const today = new Date().toISOString().split('T')[0];
    const clickRef = doc(firestore, 'link_clicks', `${link.id}_${today}`);
    setDoc(clickRef, { linkId: link.id, pageId: link.pageId, date: today, count: increment(1) }, { merge: true }).catch((err) => console.warn('Failed to track link click:', err));
  };
  const cardStyle: React.CSSProperties = {
    borderWidth: `${appearance.borderWidth || 0}px`,
    borderColor: appearance.borderColor,
    borderStyle: appearance.borderWidth ? 'solid' : 'none',
  };

  if (!appearance.borderWidth) {
      cardStyle.borderWidth = '0px';
  }

  const textStyle: React.CSSProperties = {
      color: appearance.cardForegroundColor || '#FFFFFF'
  };

  const textMutedStyle: React.CSSProperties = {
      color: appearance.cardForegroundColor || '#FFFFFF',
      opacity: 0.8,
  };

  return (
    <Card 
        className="group relative overflow-hidden transition-all duration-300 ease-in-out bg-card flex flex-col w-full h-full"
        style={cardStyle}
    >
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" onClick={handleClick}>
            <span className="sr-only">Visit {link.title}</span>
        </a>
        <div className="relative flex-grow">
            <img
                src={link.thumbnailUrl}
                alt={link.title}
                data-ai-hint={link.thumbnailHint}
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
            />
        </div>
        <div className="relative flex flex-col justify-end p-5">
            <h3 className="font-headline font-bold text-xl" style={textStyle}>{link.title}</h3>
            <p className="text-sm flex items-center gap-1.5 mt-1 truncate" style={textMutedStyle}>
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{link.url}</span>
            </p>
        </div>
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
