'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Link } from '@/lib/types';
import { Slider } from './ui/slider';
import { getWebsiteMeta } from '@/lib/actions';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const linkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Please enter a valid URL'),
  thumbnailUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  colSpan: z.number().min(1).max(4).default(1),
  rowSpan: z.number().min(1).max(2).default(1),
});

type LinkEditorFormData = z.infer<typeof linkSchema>;

interface LinkEditorProps {
  link?: Link | null;
  onSave: (data: LinkEditorFormData) => void;
  onCancel: () => void;
  mode?: 'link' | 'spotify' | 'youtube';
}

export function LinkEditor({ link, onSave, onCancel, mode = 'link' }: LinkEditorProps) {
  const form = useForm<LinkEditorFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: link?.title || '',
      url: link?.url || '',
      thumbnailUrl: link?.thumbnailUrl || '',
      colSpan: link?.colSpan || (mode === 'spotify' ? 4 : (mode === 'youtube' ? 2 : 1)),
      rowSpan: link?.rowSpan || (mode === 'youtube' ? 2 : 1),
    },
  });
  
  useEffect(() => {
    // For non-link types, we don't show the title field, but it's required by the schema.
    // So, we'll pre-fill it with a default value to pass validation.
    // The user doesn't need to see or edit this.
    if (mode === 'spotify' && !form.getValues('title')) {
      form.setValue('title', 'Spotify Track');
    }
    if (mode === 'youtube' && !form.getValues('title')) {
      form.setValue('title', 'YouTube Video');
    }
  }, [mode, form]);

  const { toast } = useToast();
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

  const handleFetchMeta = async () => {
    const url = form.getValues('url');
    if (!url) {
      toast({
        variant: 'destructive',
        title: 'URL is missing',
        description: 'Please enter a URL to fetch its metadata.',
      });
      return;
    }
    
    if (/open\.spotify\.com/.test(url) || /youtube\.com|youtu\.be/.test(url)) {
        toast({
            title: 'Special Link Detected',
            description: "This link will be displayed as an interactive embed.",
        });
        return;
    }

    setIsFetchingMeta(true);
    try {
      const result = await getWebsiteMeta(url);
      let toastShown = false;
      if (result.title) {
        form.setValue('title', result.title, { shouldValidate: true });
        if (!toastShown) {
            toast({ title: 'Metadata fetched successfully!' });
            toastShown = true;
        }
      }
      if (result.imageUrl) {
        form.setValue('thumbnailUrl', result.imageUrl, { shouldValidate: true });
        if (!toastShown) {
            toast({ title: 'Metadata fetched successfully!' });
            toastShown = true;
        }
      }
      
      if (!result.title && !result.imageUrl && !result.error) {
          toast({
              variant: 'default',
              title: 'No metadata found',
              description: 'We could not find a title or image for this URL.',
          });
      }

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching metadata',
          description: result.error,
        });
      }
    } catch(e: any) {
        toast({
            variant: 'destructive',
            title: 'An unexpected error occurred',
            description: e.message || 'Could not fetch metadata.',
        });
    } finally {
      setIsFetchingMeta(false);
    }
  };

  const onSubmit = (data: LinkEditorFormData) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        {mode === 'link' && (
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                    <Input {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input placeholder={
                    mode === 'spotify' ? "https://open.spotify.com/track/..." 
                    : mode === 'youtube' ? "https://www.youtube.com/watch?v=..."
                    : "https://example.com"
                  } {...field} />
                </FormControl>
                {mode === 'link' && (
                    <Button type="button" variant="outline" size="icon" onClick={handleFetchMeta} disabled={isFetchingMeta} aria-label="Fetch website metadata">
                    {isFetchingMeta ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    </Button>
                )}
              </div>
              <FormDescription>
                {mode === 'link' 
                  ? "Enter a URL and click the magic button to fetch its title and image."
                  : `Paste the URL of the ${mode} content you want to embed.`
                }
                </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {mode === 'link' && (
            <FormField
              control={form.control}
              name="thumbnailUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://images.unsplash.com/..." {...field} />
                  </FormControl>
                  <FormDescription>Optional. Fetched automatically for many sites.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
        )}

        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="colSpan"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Width: {field.value}</FormLabel>
                    <FormControl>
                        <Slider
                            min={1} max={4} step={1}
                            defaultValue={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                        />
                    </FormControl>
                    <FormDescription>In grid columns (1-4)</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="rowSpan"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Height: {field.value}</FormLabel>
                    <FormControl>
                         <Slider
                            min={1} max={2} step={1}
                            defaultValue={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                        />
                    </FormControl>
                    <FormDescription>In grid rows (1-2)</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            {link ? 'Cancel' : 'Back'}
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
