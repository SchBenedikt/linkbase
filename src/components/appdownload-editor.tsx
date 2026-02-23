'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from './ui/slider';
import type { Link } from '@/lib/types';

export const appDownloadSchema = z.object({
  title: z.string().min(1, 'App name is required'),
  content: z.string().optional(),
  thumbnailUrl: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
  appStoreUrl: z.string().url('Please enter a valid App Store URL').optional().or(z.literal('')),
  playStoreUrl: z.string().url('Please enter a valid Play Store URL').optional().or(z.literal('')),
  colSpan: z.number().min(1).max(4).default(2),
  rowSpan: z.number().min(1).max(6).default(1),
}).refine((d) => d.appStoreUrl || d.playStoreUrl, {
  message: 'At least one store URL is required',
  path: ['appStoreUrl'],
});

interface AppDownloadEditorProps {
  onSave: (data: z.infer<typeof appDownloadSchema>) => void;
  onCancel: () => void;
  content?: Link | null;
}

export function AppDownloadEditor({ onSave, onCancel, content }: AppDownloadEditorProps) {
  const form = useForm<z.infer<typeof appDownloadSchema>>({
    resolver: zodResolver(appDownloadSchema),
    defaultValues: {
      title: content?.title || '',
      content: content?.content || '',
      thumbnailUrl: content?.thumbnailUrl || '',
      appStoreUrl: content?.appStoreUrl || '',
      playStoreUrl: content?.playStoreUrl || '',
      colSpan: content?.colSpan || 2,
      rowSpan: content?.rowSpan || 1,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-5 p-1">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>App Name</FormLabel>
            <FormControl><Input placeholder="My Awesome App" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="content" render={({ field }) => (
          <FormItem>
            <FormLabel>Tagline (optional)</FormLabel>
            <FormControl><Input placeholder="The best app for..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="thumbnailUrl" render={({ field }) => (
          <FormItem>
            <FormLabel>App Icon URL (optional)</FormLabel>
            <FormControl><Input placeholder="https://..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="appStoreUrl" render={({ field }) => (
          <FormItem>
            <FormLabel>App Store URL</FormLabel>
            <FormControl><Input placeholder="https://apps.apple.com/app/..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="playStoreUrl" render={({ field }) => (
          <FormItem>
            <FormLabel>Google Play URL</FormLabel>
            <FormControl><Input placeholder="https://play.google.com/store/apps/details?id=..." {...field} /></FormControl>
            <FormDescription>At least one store URL is required.</FormDescription>
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
