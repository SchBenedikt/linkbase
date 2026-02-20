'use client';

import Image from 'next/image';
import { GripVertical, MoreVertical, Trash2, Edit } from 'lucide-react';
import type { Link } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface LinkCardProps {
  link: Link;
}

export function LinkCard({ link }: LinkCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow group relative overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="flex items-center">
            <div className="flex-shrink-0">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="block relative w-24 h-24 bg-secondary">
                    <Image
                        src={link.thumbnailUrl}
                        alt={link.title}
                        data-ai-hint={link.thumbnailHint}
                        fill
                        sizes="96px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </a>
            </div>
          <div className="p-4 flex-1 min-w-0">
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="block">
                <h3 className="font-headline font-semibold text-foreground truncate">{link.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{link.url}</p>
            </a>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button variant="ghost" size="icon" className="h-9 w-9 cursor-grab" aria-label="Reorder link">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Link options">
                        <MoreVertical className="h-5 w-5 text-muted-foreground" />
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
        </div>
    </Card>
  );
}
