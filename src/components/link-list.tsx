'use client';

import { PlusCircle } from 'lucide-react';
import type { Link } from '@/lib/types';
import { LinkCard } from './link-card';
import { Button } from './ui/button';

interface LinkListProps {
  links: Link[];
  setLinks: (links: Link[]) => void;
}

export function LinkList({ links }: LinkListProps) {
  // In a real app, this would open a dialog to add a new link
  const handleAddLink = () => {};

  return (
    <div className="space-y-4">
      {links.map((link) => (
        <LinkCard key={link.id} link={link} />
      ))}
      <Button variant="outline" className="w-full h-16 border-dashed hover:border-solid hover:bg-accent/20 transition-all duration-300" onClick={handleAddLink}>
        <PlusCircle className="mr-2 h-5 w-5" />
        Add New Link
      </Button>
    </div>
  );
}
