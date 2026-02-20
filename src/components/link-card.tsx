'use client';

import Image from 'next/image';
import { GripVertical, MoreVertical, Trash2, Edit, ExternalLink } from 'lucide-react';
import type { Link } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface LinkCardProps {
  link: Link;
}

export function LinkCard({ link }: LinkCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02] bg-card">
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10">
            <span className="sr-only">Visit {link.title}</span>
        </a>
        <div className="absolute inset-0">
            <Image
                src={link.thumbnailUrl}
                alt={link.title}
                data-ai-hint={link.thumbnailHint}
                fill
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        </div>
        <div className="relative flex flex-col justify-end h-40 p-4">
            <h3 className="font-headline font-bold text-lg text-white drop-shadow-md">{link.title}</h3>
            <p className="text-sm text-white/80 drop-shadow-sm flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              <span>{link.url}</span>
            </p>
        </div>
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button variant="ghost" size="icon" className="h-9 w-9 cursor-grab bg-black/30 hover:bg-black/50 text-white hover:text-white" aria-label="Reorder link">
                <GripVertical className="h-5 w-5" />
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 bg-black/30 hover:bg-black/50 text-white hover:text-white" aria-label="Link options">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </Card>
  );
}
