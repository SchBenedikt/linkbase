'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import type { Profile } from '@/lib/types';

interface ProfileHeaderProps {
  profile: Profile;
  setProfile: (profile: Profile) => void;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  // In a real app, this would open a dialog to edit the profile
  const handleEditClick = () => {};

  return (
    <header className="flex flex-col items-center text-center py-10">
      <div className="relative mb-4">
        <Avatar className="w-24 h-24 border-4 border-background ring-4 ring-primary shadow-lg">
          <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint={profile.avatarHint} />
          <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background hover:bg-secondary" onClick={handleEditClick}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit Profile Picture</span>
        </Button>
      </div>
      <div className="relative group flex items-center gap-2">
        <h1 className="font-headline text-4xl font-bold text-foreground">{profile.name}</h1>
        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleEditClick}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit Name</span>
        </Button>
      </div>
      <div className="relative group flex items-center gap-2 mt-2">
        <p className="max-w-md text-muted-foreground">{profile.bio}</p>
        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleEditClick}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit Bio</span>
        </Button>
      </div>
    </header>
  );
}
