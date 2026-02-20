'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Link } from '@/lib/types';
import { Slider } from './ui/slider';

const linkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Please enter a valid URL'),
  colSpan: z.number().min(1).max(4).default(1),
  rowSpan: z.number().min(1).max(2).default(1),
});

interface LinkEditorProps {
  link?: Link | null; // if null, it's a new link
  onSave: (data: z.infer<typeof linkSchema>) => void;
  onCancel: () => void;
}

export function LinkEditor({ link, onSave, onCancel }: LinkEditorProps) {
  const form = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: link?.title || '',
      url: link?.url || '',
      colSpan: link?.colSpan || 1,
      rowSpan: link?.rowSpan || 1,
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
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
            Cancel
          </Button>
          <Button type="submit">Save Link</Button>
        </div>
      </form>
    </Form>
  );
}
