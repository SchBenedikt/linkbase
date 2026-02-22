'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Music, Youtube, BookText, Newspaper, Rss, Image as ImageIcon, ShoppingBag, User as UserIcon } from 'lucide-react';
import { LinkEditor, linkSchema } from './link-editor';
import { TextEditor, textSchema } from './text-editor';
import { ArticleEditor, articleSchema } from './article-editor';
import { BlogOverviewEditor, blogOverviewSchema } from './blog-overview-editor';
import { ProductEditor, productSchema } from './product-editor';
import { ImageEditor, imageSchema } from './image-editor';
import { ProfileCardEditor, profileCardSchema } from './profile-card-editor';
import type { z } from 'zod';
import type { Link } from '@/lib/types';


type ContentFormData = (z.infer<typeof linkSchema> | z.infer<typeof textSchema> | z.infer<typeof articleSchema> | z.infer<typeof blogOverviewSchema> | z.infer<typeof productSchema> | z.infer<typeof imageSchema> | z.infer<typeof profileCardSchema>) & { type: Link['type'] };

interface AddContentDialogProps {
  onSave: (data: ContentFormData) => void;
  onCancel: () => void;
  contentToEdit?: Link | null;
}

export function AddContentDialog({ onSave, onCancel, contentToEdit }: AddContentDialogProps) {
  const [contentType, setContentType] = useState<Link['type'] | null>(contentToEdit?.type || null);

  const handleBack = () => setContentType(null);
  
  const handleSave = (data: z.infer<typeof linkSchema> | z.infer<typeof textSchema> | z.infer<typeof articleSchema> | z.infer<typeof blogOverviewSchema> | z.infer<typeof productSchema> | z.infer<typeof imageSchema> | z.infer<typeof profileCardSchema>, type: Link['type']) => {
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
    if (contentToEdit.type === 'blog-overview') {
      return <BlogOverviewEditor onSave={(data) => handleSave(data, 'blog-overview')} onCancel={onCancel} content={contentToEdit} />;
    }
    if (contentToEdit.type === 'product') {
        return <ProductEditor onSave={(data) => handleSave(data, 'product')} onCancel={onCancel} product={contentToEdit} />;
    }
    if (contentToEdit.type === 'image') {
        return <ImageEditor onSave={(data) => handleSave(data, 'image')} onCancel={onCancel} image={contentToEdit} />;
    }
    if (contentToEdit.type === 'profile') {
        return <ProfileCardEditor onSave={(data) => handleSave(data, 'profile')} onCancel={onCancel} content={contentToEdit} />;
    }
    return <LinkEditor onSave={(data) => handleSave(data, contentToEdit.type as 'link' | 'spotify' | 'youtube')} onCancel={onCancel} mode={contentToEdit.type as 'link' | 'spotify' | 'youtube'} link={contentToEdit} />;
  }

  // If we are adding new content, show the correct editor after selection
  if (contentType) {
    if (contentType === 'text') {
        return <TextEditor onSave={(data) => handleSave(data, 'text')} onCancel={handleBack} />;
    }
    if (contentType === 'article') {
        return <ArticleEditor onSave={(data) => handleSave(data, 'article')} onCancel={handleBack} />;
    }
    if (contentType === 'blog-overview') {
        return <BlogOverviewEditor onSave={(data) => handleSave(data, 'blog-overview')} onCancel={handleBack} />;
    }
     if (contentType === 'product') {
        return <ProductEditor onSave={(data) => handleSave(data, 'product')} onCancel={handleBack} />;
    }
    if (contentType === 'image') {
        return <ImageEditor onSave={(data) => handleSave(data, 'image')} onCancel={handleBack} />;
    }
    if (contentType === 'profile') {
        return <ProfileCardEditor onSave={(data) => handleSave(data, 'profile')} onCancel={handleBack} />;
    }
    // link, spotify, youtube
    return (
      <LinkEditor
        onSave={(data) => handleSave(data, contentType)}
        onCancel={handleBack}
        mode={contentType as 'link' | 'spotify' | 'youtube'}
      />
    );
  }

  // Initial view: show content type options
  return (
    <div className="grid grid-cols-1 gap-3 pt-4">
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
      <Button variant="outline" className="h-24 text-lg justify-start p-6" onClick={() => setContentType('image')}>
        <ImageIcon className="mr-4 h-8 w-8" />
        <div className="text-left">
            <p>Image</p>
            <p className="text-sm font-normal text-muted-foreground">Display a single image.</p>
        </div>
      </Button>
       <Button variant="outline" className="h-24 text-lg justify-start p-6" onClick={() => setContentType('article')}>
        <Newspaper className="mr-4 h-8 w-8" />
        <div className="text-left">
            <p>Article Link</p>
            <p className="text-sm font-normal text-muted-foreground">Feature an article with metadata.</p>
        </div>
      </Button>
       <Button variant="outline" className="h-24 text-lg justify-start p-6" onClick={() => setContentType('product')}>
        <ShoppingBag className="mr-4 h-8 w-8" />
        <div className="text-left">
            <p>Product</p>
            <p className="text-sm font-normal text-muted-foreground">Feature a product for sale.</p>
        </div>
      </Button>
      <Button variant="outline" className="h-24 text-lg justify-start p-6" onClick={() => setContentType('profile')}>
        <UserIcon className="mr-4 h-8 w-8" />
        <div className="text-left">
            <p>Feature a Profile</p>
            <p className="text-sm font-normal text-muted-foreground">Mention another BioBloom user.</p>
        </div>
      </Button>
      <Button variant="outline" className="h-24 text-lg justify-start p-6" onClick={() => setContentType('blog-overview')}>
        <Rss className="mr-4 h-8 w-8" />
        <div className="text-left">
            <p>Blog Overview</p>
            <p className="text-sm font-normal text-muted-foreground">Display your latest posts.</p>
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
