'use client';

import { GripVertical, MoreVertical, Trash2, Edit, ArrowRight, Briefcase } from 'lucide-react';
import type { Link as LinkType, AppearanceSettings, Page } from '@/lib/types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import NextLink from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

interface ProfileCardProps {
  link: LinkType;
  onEdit?: () => void;
  onDelete?: () => void;
  appearance: AppearanceSettings;
  isEditable?: boolean;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

export function ProfileCard({ link, onEdit, onDelete, appearance, isEditable = false, dragHandleListeners }: ProfileCardProps) {
  const firestore = useFirestore();

  const mentionedPageRef = useMemoFirebase(
      () => firestore && link.mentionedPageId ? doc(firestore, 'pages', link.mentionedPageId) : null,
      [firestore, link.mentionedPageId]
  );
  
  const { data: mentionedPage, isLoading } = useDoc<Page>(mentionedPageRef);

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

  if (isLoading) {
    return (
        <Card className="bg-card flex flex-col w-full h-full p-5 space-y-3" style={cardStyle}>
            <Skeleton className="h-6 w-3/4 bg-foreground/20" />
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-foreground/20" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-foreground/20" />
                    <Skeleton className="h-3 w-32 bg-foreground/20" />
                </div>
            </div>
            <Skeleton className="h-8 w-full bg-foreground/20" />
        </Card>
    );
  }

  if (!mentionedPage) {
     return (
        <Card className="bg-card flex items-center justify-center w-full h-full p-5" style={cardStyle}>
            <p style={textMutedStyle}>Profile not found.</p>
        </Card>
     );
  }

  const name = [mentionedPage.title, mentionedPage.firstName, mentionedPage.lastName].filter(Boolean).join(' ');
  const fallbackInitial = mentionedPage.firstName?.charAt(0).toUpperCase() || '?';

  return (
    <Card 
        className="group relative overflow-hidden transition-all duration-300 ease-in-out bg-card flex flex-col w-full h-full p-5"
        style={cardStyle}
    >
        <NextLink href={`/${mentionedPage.slug}`} passHref legacyBehavior>
            <a target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10">
                <span className="sr-only">View profile: {name}</span>
            </a>
        </NextLink>
        <div className="flex flex-col justify-between flex-grow relative z-20 space-y-3">
           <h3 className="font-headline font-bold text-xl" style={textStyle}>{link.title}</h3>
           <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-background">
                  <AvatarImage src={mentionedPage.avatarUrl} alt={name} />
                  <AvatarFallback>{fallbackInitial}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <p className="font-bold text-lg" style={textStyle}>{name}</p>
                  <p className="text-sm line-clamp-1" style={textMutedStyle}>{mentionedPage.bio}</p>
                </div>
           </div>
           <div className="flex flex-wrap items-center gap-2">
                {mentionedPage.openForWork && <Badge variant="secondary"><Briefcase className="mr-1.5 h-3 w-3" />Open for work</Badge>}
                {mentionedPage.category && <Badge variant="secondary">{mentionedPage.category}</Badge>}
           </div>
           <div className="!mt-auto pt-2">
                <div className="font-semibold flex items-center gap-1.5 text-sm" style={textStyle}>
                    View Profile <ArrowRight className="h-4 w-4" />
                </div>
            </div>
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
