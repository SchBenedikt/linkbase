'use client';

import { MoreVertical, Trash2, Edit, GripVertical } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { LinkCard } from './link-card';

interface MapCardProps {
  link: Link;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  appearance: AppearanceSettings;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

export function MapCard({ link, onEdit, onDelete, isEditable = false, appearance, dragHandleListeners }: MapCardProps) {
    
    if (!link.url) {
        return (
             <Card
                className="group relative overflow-hidden transition-all duration-300 ease-in-out bg-card w-full h-full flex items-center justify-center p-4"
            >
                <p className="text-center text-card-foreground/50">Map URL is missing.</p>
            </Card>
        );
    }

    const cardStyle: React.CSSProperties = {
        borderWidth: `${appearance.borderWidth || 0}px`,
        borderColor: appearance.borderColor,
        borderStyle: appearance.borderWidth ? 'solid' : 'none',
        backgroundColor: appearance.cardColor,
        display: 'flex',
        flexDirection: 'column'
    };

     if (!appearance.borderWidth) {
        cardStyle.borderWidth = '0px';
    }

    return (
        <Card
            className="group relative overflow-hidden transition-all duration-300 ease-in-out bg-card w-full h-full"
            style={cardStyle}
        >
            <div className="p-4 pb-2">
                <h3 className="font-bold text-card-foreground truncate">{link.title}</h3>
            </div>
            <iframe
                title={link.title}
                src={link.url}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="flex-grow"
            ></iframe>

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
