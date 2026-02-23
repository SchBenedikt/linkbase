'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, Briefcase, Instagram, Twitter, Facebook, Linkedin, Github, Youtube, Globe } from 'lucide-react';
import type { Page, SocialLink } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface ProfileHeaderProps {
  page: Partial<Page>;
  onEdit?: () => void;
  isEditable?: boolean;
}

const SoundcloudIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M3.75 18a2.25 2.25 0 0 1-2.25-2.25V8.25A2.25 2.25 0 0 1 3.75 6h.75c.62 0 1.12.5 1.12 1.12v8.75c0 .62-.5 1.12-1.12 1.12h-.75z"/>
        <path d="M8.25 18a2.25 2.25 0 0 1-2.25-2.25V6.37a2.25 2.25 0 0 1 2.25-2.25h.75c.62 0 1.12.5 1.12 1.12v11.75c0 .62-.5 1.12-1.12 1.12h-.75z"/>
        <path d="M12.75 18a2.25 2.25 0 0 1-2.25-2.25V9.37a2.25 2.25 0 0 1 2.25-2.25h.75c.62 0 1.12.5 1.12 1.12v8.75c0 .62-.5 1.12-1.12 1.12h-.75z"/>
        <path d="M17.25 18a2.25 2.25 0 0 1-2.25-2.25V10.5a2.25 2.25 0 0 1 2.25-2.25h.75c.62 0 1.12.5 1.12 1.12v5.25c0 .62-.5 1.12-1.12 1.12h-.75z"/>
        <path d="M21.75 18a2.25 2.25 0 0 1-2.25-2.25v-2.5a2.25 2.25 0 0 1 2.25-2.25h.75c.62 0 1.12.5 1.12 1.12v2.25c0 .62-.5 1.12-1.12 1.12h-.75z"/>
    </svg>
);

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.3-4.08-1.03-2.02-1.22-3.44-3.34-3.76-5.71-.02-.16-.04-.32-.04-.48-.01-3.36.01-6.72-.02-10.08.01-1.38.6-2.73 1.55-3.71 1.29-1.31 3.11-2.05 4.93-2.08 1.08-.02 2.15-.01 3.23-.02z"/>
    </svg>
);


const socialIcons: { [key: string]: React.ElementType } = {
    instagram: Instagram,
    x: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
    github: Github,
    youtube: Youtube,
    website: Globe,
    tiktok: TiktokIcon,
    pinterest: Globe, // Fallback icon
    soundcloud: SoundcloudIcon,
};

const renderSocialLink = (link: SocialLink) => {
    const Icon = socialIcons[link.platform.toLowerCase()] || Globe;
    return (
        <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
            <Icon className="h-6 w-6" />
            <span className="sr-only">{link.platform}</span>
        </a>
    );
};

export function ProfileHeader({ page, onEdit, isEditable = false }: ProfileHeaderProps) {
  const name = [page.firstName, page.lastName].filter(Boolean).join(' ') || page.title || 'User';
  const bio = page.bio || '';
  const avatarUrl = page.avatarUrl || '';
  const avatarHint = page.avatarHint || '';
  const fallbackInitial = page.firstName?.charAt(0).toUpperCase() || '?';
  
  return (
    <div className="flex flex-col items-center md:items-start text-center md:text-left w-full">
      <div className="relative mb-6">
        <Avatar className="w-28 h-28 border-4 border-background ring-4 ring-primary shadow-lg">
          <AvatarImage src={avatarUrl} alt={name} data-ai-hint={avatarHint} />
          <AvatarFallback>{fallbackInitial}</AvatarFallback>
        </Avatar>
        {isEditable && onEdit && (
            <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full h-9 w-9 bg-background hover:bg-secondary" onClick={onEdit}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit Profile</span>
            </Button>
        )}
      </div>
      
      <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">{name}</h1>
      
      <div className="mt-4 flex flex-wrap justify-center md:justify-start items-center gap-2">
        {page.openForWork && (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white border-green-700">
                <Briefcase className="mr-1.5 h-3 w-3" />
                Open for work
            </Badge>
        )}
        {page.categories && page.categories.map(category => (
            <Badge key={category} variant="secondary">{category}</Badge>
        ))}
    </div>

      <p className="max-w-md text-lg text-muted-foreground mt-3">{bio}</p>

      {page.socialLinks && page.socialLinks.length > 0 && (
        <div className="mt-4 flex items-center justify-center md:justify-start gap-4">
            {page.socialLinks.filter(l => l.url).map(renderSocialLink)}
        </div>
    )}
    </div>
  );
}
