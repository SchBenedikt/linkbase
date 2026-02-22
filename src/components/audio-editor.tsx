'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from './ui/slider';
import type { Link } from '@/lib/types';

export const audioSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  audioUrl: z.string().url('Please enter a valid audio URL').min(1, 'Audio URL is required'),
  thumbnailUrl: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
  colSpan: z.number().min(1).max(4).default(2),
  rowSpan: z.number().min(1).max(6).default(1),
});

interface AudioEditorProps {
  onSave: (data: z.infer<typeof audioSchema>) => void;
  onCancel: () => void;
  content?: Link | null;
}

export function AudioEditor({ onSave, onCancel, content }: AudioEditorProps) {
  const form = useForm<z.infer<typeof audioSchema>>({
    resolver: zodResolver(audioSchema),
    defaultValues: {
      title: content?.title || '',
      content: content?.content || '',
      audioUrl: content?.audioUrl || content?.url || '',
      thumbnailUrl: content?.thumbnailUrl || '',
      colSpan: content?.colSpan || 2,
      rowSpan: content?.rowSpan || 1,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-5 p-1">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Track / Episode Title</FormLabel>
            <FormControl><Input placeholder="My Podcast Episode #1" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="content" render={({ field }) => (
          <FormItem>
            <FormLabel>Artist / Description (optional)</FormLabel>
            <FormControl><Input placeholder="Artist name or description" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="audioUrl" render={({ field }) => (
          <FormItem>
            <FormLabel>Audio URL</FormLabel>
            <FormControl><Input placeholder="https://example.com/track.mp3" {...field} /></FormControl>
            <FormDescription>Direct link to .mp3, .ogg, .wav, or .m4a file.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="thumbnailUrl" render={({ field }) => (
          <FormItem>
            <FormLabel>Cover Image URL (optional)</FormLabel>
            <FormControl><Input placeholder="https://..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="colSpan" render={({ field }) => (
            <FormItem>
              <FormLabel>Width: {field.value}</FormLabel>
              <FormControl>
                <Slider min={1} max={4} step={1} defaultValue={[field.value]} onValueChange={(v) => field.onChange(v[0])} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="rowSpan" render={({ field }) => (
            <FormItem>
              <FormLabel>Height: {field.value}</FormLabel>
              <FormControl>
                <Slider min={1} max={6} step={1} defaultValue={[field.value]} onValueChange={(v) => field.onChange(v[0])} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>{content ? 'Cancel' : 'Back'}</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
