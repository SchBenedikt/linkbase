'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from './ui/slider';
import type { Link } from '@/lib/types';

export const videoSchema = z.object({
  title: z.string().optional(),
  url: z.string().url('Please enter a valid video URL'),
  colSpan: z.number().min(1).max(4).default(2),
  rowSpan: z.number().min(1).max(4).default(2),
});

type VideoEditorFormData = z.infer<typeof videoSchema>;

interface VideoEditorProps {
  content?: Link | null;
  onSave: (data: VideoEditorFormData) => void;
  onCancel: () => void;
}

export function VideoEditor({ content, onSave, onCancel }: VideoEditorProps) {
  const form = useForm<VideoEditorFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: content?.title || '',
      url: content?.url || '',
      colSpan: content?.colSpan || 2,
      rowSpan: content?.rowSpan || 2,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="My Video" />
              </FormControl>
              <FormDescription>Optional caption below the player.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com/video.mp4" />
              </FormControl>
              <FormDescription>Direct link to an MP4 or WebM file.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="colSpan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Width: {field.value}</FormLabel>
                <FormControl>
                  <Slider min={1} max={4} step={1} defaultValue={[field.value]} onValueChange={(v) => field.onChange(v[0])} />
                </FormControl>
                <FormDescription>In grid columns (1-4)</FormDescription>
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
                  <Slider min={1} max={4} step={1} defaultValue={[field.value]} onValueChange={(v) => field.onChange(v[0])} />
                </FormControl>
                <FormDescription>In grid rows (1-4)</FormDescription>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>{content ? 'Cancel' : 'Back'}</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
