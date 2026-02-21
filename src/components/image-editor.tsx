'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Link } from '@/lib/types';
import { Slider } from './ui/slider';

export const imageSchema = z.object({
  title: z.string(), // Hidden, but required by the data model
  thumbnailUrl: z.string().url('Please enter a valid image URL'),
  url: z.string().url().optional().or(z.literal('')),
  colSpan: z.number().min(1).max(4).default(2),
  rowSpan: z.number().min(1).max(2).default(2),
});

type ImageEditorFormData = z.infer<typeof imageSchema>;

interface ImageEditorProps {
  image?: Link | null;
  onSave: (data: ImageEditorFormData) => void;
  onCancel: () => void;
}

export function ImageEditor({ image, onSave, onCancel }: ImageEditorProps) {
  const form = useForm<ImageEditorFormData>({
    resolver: zodResolver(imageSchema),
    defaultValues: {
      title: image?.title || 'Image',
      thumbnailUrl: image?.thumbnailUrl || '',
      url: image?.url || '',
      colSpan: image?.colSpan || 2,
      rowSpan: image?.rowSpan || 2,
    },
  });

  useEffect(() => {
    // Ensure title is set for validation, but not shown to user.
    if (!form.getValues('title')) {
        form.setValue('title', 'Image');
    }
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="thumbnailUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://images.unsplash.com/..." {...field} />
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
              <FormLabel>Link URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormDescription>Make the image clickable.</FormDescription>
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
            {image ? 'Cancel' : 'Back'}
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
