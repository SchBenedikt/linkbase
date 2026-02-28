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

// Internal form schema (structured fields for the form UI)
const _internalSchema = z.object({
  title: z.string().optional(),
  quote: z.string().min(1, 'Quote is required'),
  name: z.string().min(1, 'Name is required'),
  role: z.string().optional(),
  avatarUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  rating: z.number().min(1).max(5).default(5),
  colSpan: z.number().min(1).max(4).default(2),
  rowSpan: z.number().min(1).max(4).default(2),
});

// External schema (what the parent receives — content is JSON string)
export const testimonialSchema = z.object({
  title: z.string().optional(),
  content: z.string(),
  colSpan: z.number().min(1).max(4).default(2),
  rowSpan: z.number().min(1).max(4).default(2),
});

type InternalFormData = z.infer<typeof _internalSchema>;
type TestimonialEditorFormData = z.infer<typeof testimonialSchema>;

interface TestimonialEditorProps {
  content?: Link | null;
  onSave: (data: TestimonialEditorFormData) => void;
  onCancel: () => void;
}

function parseExisting(content?: Link | null): Partial<InternalFormData> {
  if (!content?.content) return {};
  try {
    return JSON.parse(content.content) as Partial<InternalFormData>;
  } catch {
    return {};
  }
}

export function TestimonialEditor({ content, onSave, onCancel }: TestimonialEditorProps) {
  const existing = parseExisting(content);

  const form = useForm<InternalFormData>({
    resolver: zodResolver(_internalSchema),
    defaultValues: {
      title: content?.title || '',
      quote: existing.quote || '',
      name: existing.name || '',
      role: existing.role || '',
      avatarUrl: existing.avatarUrl || '',
      rating: existing.rating ?? 5,
      colSpan: content?.colSpan ?? 2,
      rowSpan: content?.rowSpan ?? 2,
    },
  });

  const handleSubmit = (data: InternalFormData) => {
    const { title, colSpan, rowSpan, ...rest } = data;
    onSave({
      title: title || 'Testimonial',
      content: JSON.stringify({ quote: rest.quote, name: rest.name, role: rest.role, avatarUrl: rest.avatarUrl, rating: rest.rating }),
      colSpan,
      rowSpan,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 p-1">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Title (optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. What customers say" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quote *</FormLabel>
              <FormControl>
                <Textarea placeholder="This product changed my life..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role / Company</FormLabel>
                <FormControl>
                  <Input placeholder="CEO at Acme" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL (optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/avatar.jpg" {...field} />
              </FormControl>
              <FormDescription>Link to a profile photo.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Star Rating: {field.value}</FormLabel>
              <FormControl>
                <Slider
                  min={1} max={5} step={1}
                  defaultValue={[field.value]}
                  onValueChange={(v) => field.onChange(v[0])}
                />
              </FormControl>
              <FormDescription>1 – 5 stars</FormDescription>
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
                <FormDescription>Grid columns (1–4)</FormDescription>
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
                  <Slider min={1} max={4} step={1} defaultValue={[field.value]} onValueChange={(v) => field.onChange(v[0])} />
                </FormControl>
                <FormDescription>Grid rows (1–4)</FormDescription>
                <FormMessage />
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
