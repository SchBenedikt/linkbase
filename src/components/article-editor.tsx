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

export const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Please enter a valid URL to the article'),
  excerpt: z.string().max(200, 'Excerpt cannot be longer than 200 characters.').optional(),
  publicationDate: z.string().optional(),
  readingTime: z.string().optional(),
  colSpan: z.number().min(1).max(4).default(2),
  rowSpan: z.number().min(1).max(2).default(1),
});

type ArticleEditorFormData = z.infer<typeof articleSchema>;

interface ArticleEditorProps {
  article?: Link | null;
  onSave: (data: ArticleEditorFormData) => void;
  onCancel: () => void;
}

export function ArticleEditor({ article, onSave, onCancel }: ArticleEditorProps) {
  const form = useForm<ArticleEditorFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title || '',
      url: article?.url || '',
      excerpt: article?.excerpt || '',
      publicationDate: article?.publicationDate || '',
      readingTime: article?.readingTime || '',
      colSpan: article?.colSpan || 2,
      rowSpan: article?.rowSpan || 1,
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
              <FormLabel>Article Title</FormLabel>
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
              <FormLabel>Article URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/my-article" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} placeholder="A short summary of the article..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="publicationDate"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Publication Date</FormLabel>
                    <FormControl>
                        <Input {...field} placeholder="e.g. Jan 1, 2024" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="readingTime"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Reading Time</FormLabel>
                    <FormControl>
                        <Input {...field} placeholder="e.g. 5 min read" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
        </div>

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
            {article ? 'Cancel' : 'Back'}
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
