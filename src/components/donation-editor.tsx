'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from './ui/slider';
import type { Link } from '@/lib/types';

export const donationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  url: z.string().url('Please enter a valid donation URL').min(1, 'Donation URL is required'),
  donationButtonText: z.string().optional(),
  colSpan: z.number().min(1).max(4).default(2),
  rowSpan: z.number().min(1).max(6).default(1),
});

interface DonationEditorProps {
  onSave: (data: z.infer<typeof donationSchema>) => void;
  onCancel: () => void;
  content?: Link | null;
}

export function DonationEditor({ onSave, onCancel, content }: DonationEditorProps) {
  const form = useForm<z.infer<typeof donationSchema>>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      title: content?.title || 'Support me ☕',
      content: content?.content || '',
      url: content?.url || '',
      donationButtonText: content?.donationButtonText || 'Donate',
      colSpan: content?.colSpan || 2,
      rowSpan: content?.rowSpan || 1,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-5 p-1">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl><Input placeholder="Support me ☕" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="content" render={({ field }) => (
          <FormItem>
            <FormLabel>Description (optional)</FormLabel>
            <FormControl><Textarea placeholder="If you enjoy my work, consider buying me a coffee!" {...field} rows={2} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="url" render={({ field }) => (
          <FormItem>
            <FormLabel>Donation / Support URL</FormLabel>
            <FormControl>
              <Input placeholder="https://buymeacoffee.com/... or https://paypal.me/..." {...field} />
            </FormControl>
            <FormDescription>Supports PayPal.Me, Buy Me a Coffee, Ko-fi, Patreon, etc.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="donationButtonText" render={({ field }) => (
          <FormItem>
            <FormLabel>Button Text</FormLabel>
            <FormControl><Input placeholder="Donate" {...field} /></FormControl>
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
