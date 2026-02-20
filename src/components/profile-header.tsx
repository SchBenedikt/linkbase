'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import type { Page } from '@/lib/types';

interface ProfileHeaderProps {
  page: Partial<Page>;
  onEdit?: () => void;
  isEditable?: boolean;
}

export function ProfileHeader({ page, onEdit, isEditable = false }: ProfileHeaderProps) {
  const displayName = page.displayName || 'User';
  const bio = page.bio || '';
  const avatarUrl = page.avatarUrl || '';
  const avatarHint = page.avatarHint || '';
  
  return (
    <header className="flex flex-col items-center text-center py-10 md:py-16">
      <div className="relative mb-6 mx-auto">
        <Avatar className="w-28 h-28 border-4 border-background ring-4 ring-primary shadow-lg">
          <AvatarImage src={avatarUrl} alt={displayName} data-ai-hint={avatarHint} />
          <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        {isEditable && onEdit && (
            <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full h-9 w-9 bg-background hover:bg-secondary" onClick={onEdit}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit Profile</span>
            </Button>
        )}
      </div>
      <div className="relative group flex items-center gap-2">
        <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">{displayName}</h1>
        {isEditable && onEdit && (
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={onEdit}>
                <Edit className="h-5 w-5" />
                <span className="sr-only">Edit Profile</span>
            </Button>
        )}
      </div>
      <div className="relative group flex items-center gap-2 mt-3">
        <p className="max-w-md text-lg text-muted-foreground">{bio}</p>
        {isEditable && onEdit && (
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={onEdit}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit Profile</span>
            </Button>
        )}
      </div>
    </header>
  );
}
