'use client';

import Image from 'next/image';
import { MoreVertical, Trash2, Edit } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface SpotifyLinkCardProps {
  link: Link;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  appearance: AppearanceSettings;
}

export function SpotifyLinkCard({ link, onEdit, onDelete, isEditable = false, appearance }: SpotifyLinkCardProps) {
    const trackId = link.url.split('track/')[1]?.split('?')[0];

    if (!trackId) return null;

    const embedUrl = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;

    const cardStyle: React.CSSProperties = {
        borderWidth: `${appearance.borderWidth || 0}px`,
        borderColor: appearance.borderColor,
        borderStyle: appearance.borderWidth ? 'solid' : 'none',
        backgroundColor: appearance.cardColor,
    };

     if (!appearance.borderWidth) {
        cardStyle.borderWidth = '0px';
    }

    return (
        <Card
            className="group relative overflow-hidden transition-all duration-300 ease-in-out bg-card"
            style={cardStyle}
        >
            <div className="flex flex-col">
                <div className="z-10 p-3 pb-0">
                     <iframe
                        src={embedUrl}
                        width="100%"
                        height="80"
                        frameBorder="0"
                        allowFullScreen={false}
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-lg"
                    ></iframe>
                </div>

                <div className="relative h-48 w-full -mt-3">
                    <Image
                        src={link.thumbnailUrl}
                        alt={link.title}
                        data-ai-hint={link.thumbnailHint}
                        fill
                        sizes="(max-width: 640px) 100vw, 640px"
                        className="object-cover"
                    />
                </div>
            </div>

            {isEditable && onEdit && onDelete && (
                 <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
