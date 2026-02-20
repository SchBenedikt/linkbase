'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Music } from 'lucide-react';
import { LinkEditor, linkSchema } from './link-editor';
import type { z } from 'zod';

interface AddContentDialogProps {
  onSave: (data: z.infer<typeof linkSchema>, thumbnailUrl?: string) => void;
  onCancel: () => void;
}

export function AddContentDialog({ onSave, onCancel }: AddContentDialogProps) {
  const [contentType, setContentType] = useState<'link' | 'spotify' | null>(null);

  const handleBack = () => setContentType(null);

  if (contentType) {
    return (
      <LinkEditor
        onSave={onSave}
        onCancel={handleBack}
        mode={contentType}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <Button variant="outline" className="h-24 text-lg justify-start p-6" onClick={() => setContentType('link')}>
        <LinkIcon className="mr-4 h-8 w-8" />
        <div className="text-left">
            <p>Standard Link</p>
            <p className="text-sm font-normal text-muted-foreground">Add a link to any website.</p>
        </div>
      </Button>
      <Button variant="outline" className="h-24 text-lg justify-start p-6" onClick={() => setContentType('spotify')}>
        <Music className="mr-4 h-8 w-8" />
        <div className="text-left">
            <p>Spotify Track</p>
            <p className="text-sm font-normal text-muted-foreground">Embed a song from Spotify.</p>
        </div>
      </Button>
      <div className="mt-4 flex justify-end">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
