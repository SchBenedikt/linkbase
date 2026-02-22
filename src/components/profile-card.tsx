'use client';

import { GripVertical, MoreVertical, Trash2, Edit, ArrowRight, Briefcase } from 'lucide-react';
import type { Link as LinkType, AppearanceSettings, UserProfile } from '@/lib/types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, limit } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import NextLink from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import type { Page } from '@/lib/types';


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

  const mentionedUserRef = useMemoFirebase(
      () => firestore && link.mentionedUserId ? doc(firestore, 'user_profiles', link.mentionedUserId) : null,
      [firestore, link.mentionedUserId]
  );
  
  const { data: mentionedUser, isLoading: isUserLoading } = useDoc<UserProfile>(mentionedUserRef);

  const mentionedUserPageQuery = useMemoFirebase(() =>
    (firestore && link.mentionedUserId) 
      ? query(collection(firestore, 'pages'), where('ownerId', '==', link.mentionedUserId), where('status', '==', 'published'), limit(1))
      : null,
    [firestore, link.mentionedUserId]
  );

  const { data: mentionedUserPages, isLoading: arePagesLoading } = useCollection<Page>(mentionedUserPageQuery);
  const primaryPage = mentionedUserPages?.[0];

  const isLoading = isUserLoading || arePagesLoading;

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

  if (!mentionedUser) {
     return (
        <Card className="bg-card flex items-center justify-center w-full h-full p-5" style={cardStyle}>
            <p style={textMutedStyle}>Profile not found.</p>
        </Card>
     );
  }

  const name = [mentionedUser.title, mentionedUser.firstName, mentionedUser.lastName].filter(Boolean).join(' ');
  const fallbackInitial = mentionedUser.firstName?.charAt(0).toUpperCase() || '?';

  return (
    <Card 
        className="group relative overflow-hidden transition-all duration-300 ease-in-out bg-card flex flex-col w-full h-full p-5"
        style={cardStyle}
    >
        {primaryPage && (
            <NextLink href={`/${primaryPage.slug}`} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10">
                <span className="sr-only">View profile: {name}</span>
            </NextLink>
        )}
        <div className="flex flex-col justify-between flex-grow relative z-20 space-y-3">
           <h3 className="font-headline font-bold text-xl" style={textStyle}>{link.title}</h3>
           <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-background">
                  <AvatarImage src={mentionedUser.avatarUrl} alt={name} />
                  <AvatarFallback>{fallbackInitial}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <p className="font-bold text-lg" style={textStyle}>{name}</p>
                  <p className="text-sm line-clamp-1" style={textMutedStyle}>{mentionedUser.bio}</p>
                </div>
           </div>
           <div className="flex flex-wrap items-center gap-2">
                {mentionedUser.openForWork && <Badge variant="secondary"><Briefcase className="mr-1.5 h-3 w-3" />Open for work</Badge>}
                {mentionedUser.category && <Badge variant="secondary">{mentionedUser.category}</Badge>}
           </div>
           {primaryPage && (
                <div className="!mt-auto pt-2">
                    <div className="font-semibold flex items-center gap-1.5 text-sm" style={textStyle}>
                        View Profile <ArrowRight className="h-4 w-4" />
                    </div>
                </div>
           )}
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
