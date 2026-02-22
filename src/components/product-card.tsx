'use client';

import { GripVertical, MoreVertical, Trash2, Edit, ArrowRight, DollarSign } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface ProductCardProps {
  link: Link;
  onEdit?: () => void;
  onDelete?: () => void;
  appearance: AppearanceSettings;
  isEditable?: boolean;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

export function ProductCard({ link, onEdit, onDelete, appearance, isEditable = false, dragHandleListeners }: ProductCardProps) {
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
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10">
            <span className="sr-only">View product: {link.title}</span>
        </a>
       
        {link.thumbnailUrl && (
            <div className="relative aspect-video">
                 <img
                    src={link.thumbnailUrl}
                    alt={link.title}
                    data-ai-hint={link.thumbnailHint}
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                />
            </div>
        )}

        <CardHeader className="pt-5 pb-2 relative z-20">
            <CardTitle style={textStyle}>{link.title}</CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0 pb-4 flex-grow relative z-20">
            <p className="text-sm" style={textMutedStyle}>
                {link.content}
            </p>
        </CardContent>

        <CardFooter className="pt-0 flex justify-between items-center relative z-20">
            {link.price && <div className="font-bold text-lg flex items-center" style={textStyle}><DollarSign className="h-4 w-4 mr-1" />{link.price}</div>}
            <div className="font-semibold flex items-center gap-1.5" style={textStyle}>
                Buy Now <ArrowRight className="h-4 w-4" />
            </div>
        </CardFooter>

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
