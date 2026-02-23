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

export const contactInfoSchema = z.object({
  title: z.string().optional(),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  content: z.string().optional(),
  colSpan: z.number().min(1).max(4).default(2),
  rowSpan: z.number().min(1).max(6).default(1),
}).refine((d) => d.email || d.phone, { message: 'At least one of email or phone is required', path: ['email'] });

interface ContactInfoEditorProps {
  onSave: (data: z.infer<typeof contactInfoSchema>) => void;
  onCancel: () => void;
  content?: Link | null;
}

export function ContactInfoEditor({ onSave, onCancel, content }: ContactInfoEditorProps) {
  const form = useForm<z.infer<typeof contactInfoSchema>>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      title: content?.title || 'Contact me',
      email: content?.email || '',
      phone: content?.phone || '',
      content: content?.content || '',
      colSpan: content?.colSpan || 2,
      rowSpan: content?.rowSpan || 1,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-5 p-1">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Card Title (optional)</FormLabel>
            <FormControl><Input placeholder="Contact me" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input type="email" placeholder="hello@example.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>Phone (optional)</FormLabel>
            <FormControl><Input type="tel" placeholder="+49 123 456789" {...field} /></FormControl>
            <FormDescription>Displayed as a clickable tel: link.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="content" render={({ field }) => (
          <FormItem>
            <FormLabel>Note (optional)</FormLabel>
            <FormControl><Textarea placeholder="Best reached on weekdays..." {...field} rows={2} /></FormControl>
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
