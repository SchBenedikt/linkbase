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
import { Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

export const linkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Please enter a valid URL'),
  thumbnailUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  content: z.string().optional(),
  colSpan: z.number().min(1).max(4).default(1),
  rowSpan: z.number().min(1).max(2).default(1),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
});

type LinkEditorFormData = z.infer<typeof linkSchema>;

interface LinkEditorProps {
  link?: Link | null;
  onSave: (data: LinkEditorFormData) => void;
  onCancel: () => void;
  mode?: 'link' | 'spotify' | 'youtube' | 'instagram' | 'tiktok' | 'soundcloud' | 'vimeo' | 'calendly' | 'github' | 'twitter' | 'twitch' | 'pinterest' | 'discord';
}

export function LinkEditor({ link, onSave, onCancel, mode = 'link' }: LinkEditorProps) {
  const form = useForm<LinkEditorFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: link?.title || '',
      url: link?.url || '',
      thumbnailUrl: link?.thumbnailUrl || '',
      content: link?.content || '',
      colSpan: link?.colSpan || (mode === 'spotify' || mode === 'soundcloud' ? 4 : (mode === 'youtube' || mode === 'vimeo' || mode === 'instagram' || mode === 'tiktok' || mode === 'twitch' || mode === 'discord' ? 2 : 1)),
      rowSpan: link?.rowSpan || (mode === 'youtube' || mode === 'vimeo' || mode === 'instagram' || mode === 'tiktok' || mode === 'twitch' || mode === 'discord' ? 2 : 1),
      scheduledStart: link?.scheduledStart || '',
      scheduledEnd: link?.scheduledEnd || '',
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
    if (mode === 'instagram' && !form.getValues('title')) form.setValue('title', 'Instagram Post');
    if (mode === 'tiktok' && !form.getValues('title')) form.setValue('title', 'TikTok Video');
    if (mode === 'soundcloud' && !form.getValues('title')) form.setValue('title', 'SoundCloud Track');
    if (mode === 'vimeo' && !form.getValues('title')) form.setValue('title', 'Vimeo Video');
    if (mode === 'calendly' && !form.getValues('title')) form.setValue('title', 'Book a Meeting');
    if (mode === 'github' && !form.getValues('title')) form.setValue('title', 'GitHub Repository');
    if (mode === 'twitter' && !form.getValues('title')) form.setValue('title', 'Tweet / X Post');
    if (mode === 'twitch' && !form.getValues('title')) form.setValue('title', 'Twitch Stream');
    if (mode === 'pinterest' && !form.getValues('title')) form.setValue('title', 'Pinterest Pin');
    if (mode === 'discord' && !form.getValues('title')) form.setValue('title', 'Discord Server');
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
                    : mode === 'instagram' ? "https://www.instagram.com/p/..."
                    : mode === 'tiktok' ? "https://www.tiktok.com/@username/video/..."
                    : mode === 'soundcloud' ? "https://soundcloud.com/artist/track"
                    : mode === 'vimeo' ? "https://vimeo.com/123456789"
                    : mode === 'calendly' ? "https://calendly.com/username/meeting-type"
                    : mode === 'github' ? "https://github.com/owner/repo"
                    : mode === 'twitter' ? "https://x.com/username/status/123456789"
                    : mode === 'twitch' ? "https://www.twitch.tv/channel-name"
                    : mode === 'pinterest' ? "https://www.pinterest.com/pin/123456789"
                    : mode === 'discord' ? "https://discord.com/widget?id=YOUR_SERVER_ID"
                    : "https://example.com"
                  } {...field} />
                </FormControl>
                {mode === 'link' && (
                    <Button type="button" variant="outline" size="icon" onClick={handleFetchMeta} disabled={isFetchingMeta} aria-label="Fetch website metadata">
                    {isFetchingMeta ? <Loader2 className="animate-spin" /> : <ExternalLink />}
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

        {mode === 'github' && (
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repository Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="A short description of the repository..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
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

        {/* Optional scheduling */}
        <details className="border rounded-lg p-3 text-sm">
          <summary className="cursor-pointer font-medium text-muted-foreground select-none">
            Schedule visibility (optional)
          </summary>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <FormField
              control={form.control}
              name="scheduledStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visible from</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scheduledEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visible until</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </details>

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
