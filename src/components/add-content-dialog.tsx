'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Music, Youtube, BookText, Newspaper } from 'lucide-react';
import { LinkEditor, linkSchema } from './link-editor';
import { TextEditor, textSchema } from './text-editor';
import { ArticleEditor, articleSchema } from './article-editor';
import type { z } from 'zod';
import type { Link } from '@/lib/types';


type ContentFormData = (z.infer<typeof linkSchema> | z.infer<typeof textSchema> | z.infer<typeof articleSchema>) & { type: Link['type'] };

interface AddContentDialogProps {
  onSave: (data: ContentFormData) => void;
  onCancel: () => void;
  contentToEdit?: Link | null;
}

export function AddContentDialog({ onSave, onCancel, contentToEdit }: AddContentDialogProps) {
  const [contentType, setContentType] = useState<'link' | 'spotify' | 'youtube' | 'text' | 'article' | null>(contentToEdit?.type || null);

  const handleBack = () => setContentType(null);
  
  const handleSave = (data: z.infer<typeof linkSchema> | z.infer<typeof textSchema> | z.infer<typeof articleSchema>, type: Link['type']) => {
    onSave({ ...data, type });
  };

  // If we are editing, jump straight to the editor
  if (contentType && contentToEdit) {
     if (contentToEdit.type === 'text') {
        return <TextEditor onSave={(data) => handleSave(data, 'text')} onCancel={onCancel} content={contentToEdit} />;
    }
    if (contentToEdit.type === 'article') {
        return <ArticleEditor onSave={(data) => handleSave(data, 'article')} onCancel={onCancel} article={contentToEdit} />;
    }
    return <LinkEditor onSave={(data) => handleSave(data, contentToEdit.type)} onCancel={onCancel} mode={contentToEdit.type} link={contentToEdit} />;
  }

  // If we are adding new content, show the correct editor after selection
  if (contentType) {
    if (contentType === 'text') {
        return <TextEditor onSave={(data) => handleSave(data, 'text')} onCancel={handleBack} />;
    }
    if (contentType === 'article') {
        return <ArticleEditor onSave={(data) => handleSave(data, 'article')} onCancel={handleBack} />;
    }
    // link, spotify, youtube
    return (
      <LinkEditor
        onSave={(data) => handleSave(data, contentType)}
        onCancel={handleBack}
        mode={contentType}
      />
    );
  }

  // Initial view: show content type options
  return (
    <div className="flex flex-col gap-4 pt-4">
      <Button variant="outline" className="h-24 text-lg justify-start p-6" onClick={() => setContentType('link')}>
        <LinkIcon className="mr-4 h-8 w-8" />
        <div className="text-left">
            <p>Standard Link</p>
            <p className="text-sm font-normal text-muted-foreground">Add a link to any website.</p>
        </div>
      </Button>
       <Button variant="outline" className="h-24 text-lg justify-start p-6" onClick={() => setContentType('text')}>
        <BookText className="mr-4 h-8 w-8" />
        <div className="text-left">
            <p>Text Block</p>
            <p className="text-sm font-normal text-muted-foreground">Add a title and some text.</p>
        </div>
      </Button>
      <Button variant="outline" className="h-24 text-lg justify-start p-6" onClick={() => setContentType('article')}>
        <Newspaper className="mr-4 h-8 w-8" />
        <div className="text-left">
            <p>Article Link</p>
            <p className="text-sm font-normal text-muted-foreground">Feature an article with metadata.</p>
        </div>
      </Button>
      <Button variant="outline" className="h-24 text-lg justify-start p-6" onClick={() => setContentType('spotify')}>
        <Music className="mr-4 h-8 w-8" />
        <div className="text-left">
            <p>Spotify Track</p>
            <p className="text-sm font-normal text-muted-foreground">Embed a song from Spotify.</p>
        </div>
      </Button>
       <Button variant="outline" className="h-24 text-lg justify-start p-6" onClick={() => setContentType('youtube')}>
        <Youtube className="mr-4 h-8 w-8" />
        <div className="text-left">
            <p>YouTube Video</p>
            <p className="text-sm font-normal text-muted-foreground">Embed a video from YouTube.</p>
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
