'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from './ui/slider';
import type { Link } from '@/lib/types';

export const headerSchema = z.object({
  title: z.string().default(''),
  colSpan: z.number().min(1).max(4).default(4),
  rowSpan: z.number().min(1).max(2).default(1),
});

type HeaderEditorFormData = z.infer<typeof headerSchema>;

interface HeaderEditorProps {
  content?: Link | null;
  onSave: (data: HeaderEditorFormData) => void;
  onCancel: () => void;
}

export function HeaderEditor({ content, onSave, onCancel }: HeaderEditorProps) {
  const form = useForm<HeaderEditorFormData>({
    resolver: zodResolver(headerSchema),
    defaultValues: {
      title: content?.title || '',
      colSpan: content?.colSpan || 4,
      rowSpan: content?.rowSpan || 1,
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
              <FormLabel>Section Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. My Projects, Social Media…" />
              </FormControl>
              <FormDescription>Optional — leave blank for a simple divider line.</FormDescription>
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
                  <Slider min={1} max={2} step={1} defaultValue={[field.value]} onValueChange={(v) => field.onChange(v[0])} />
                </FormControl>
                <FormDescription>In grid rows (1-2)</FormDescription>
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
