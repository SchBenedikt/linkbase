'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Link } from '@/lib/types';
import { Slider } from './ui/slider';

export const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Please enter a valid product URL'),
  thumbnailUrl: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
  content: z.string().optional(), // for description
  price: z.string().optional(),
  colSpan: z.number().min(1).max(4).default(2),
  rowSpan: z.number().min(1).max(2).default(2),
});

type ProductEditorFormData = z.infer<typeof productSchema>;

interface ProductEditorProps {
  product?: Link | null;
  onSave: (data: ProductEditorFormData) => void;
  onCancel: () => void;
}

export function ProductEditor({ product, onSave, onCancel }: ProductEditorProps) {
  const form = useForm<ProductEditorFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product?.title || '',
      url: product?.url || '',
      thumbnailUrl: product?.thumbnailUrl || '',
      content: product?.content || '',
      price: product?.price || '',
      colSpan: product?.colSpan || 2,
      rowSpan: product?.rowSpan || 2,
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
              <FormLabel>Product Name</FormLabel>
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
              <FormLabel>Product URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/my-product" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="thumbnailUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://images.unsplash.com/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} placeholder="A short description of the product..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. $19.99" />
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
            {product ? 'Cancel' : 'Back'}
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
