'use client';

import { PlusCircle } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { LinkCard } from './link-card';
import { Button } from './ui/button';

interface LinkListProps {
  links: Link[];
  onAddLink: () => void;
  onEditLink: (link: Link) => void;
  onDeleteLink: (link: Link) => void;
  appearance: AppearanceSettings;
}

export function LinkList({ links, onAddLink, onEditLink, onDeleteLink, appearance }: LinkListProps) {
  return (
    <div className="space-y-4">
      {links.map((link) => (
        <LinkCard
          key={link.id}
          link={link}
          onEdit={() => onEditLink(link)}
          onDelete={() => onDeleteLink(link)}
          appearance={appearance}
        />
      ))}
      <Button variant="outline" className="w-full h-16 border-dashed hover:border-solid hover:bg-accent/20 transition-all duration-300" onClick={onAddLink}>
        <PlusCircle className="mr-2 h-5 w-5" />
        Add New Link
      </Button>
    </div>
  );
}
