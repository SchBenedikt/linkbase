'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from './ui/slider';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { Link } from '@/lib/types';

// Internal form schema (structured for the UI)
const _internalFaqSchema = z.object({
  title: z.string().optional(),
  items: z.array(z.object({
    question: z.string().min(1, 'Question is required'),
    answer: z.string().min(1, 'Answer is required'),
  })).min(1, 'Add at least one FAQ item'),
  colSpan: z.number().min(1).max(4).default(2),
  rowSpan: z.number().min(1).max(6).default(3),
});

// External schema (content is JSON string)
export const faqSchema = z.object({
  title: z.string().optional(),
  content: z.string(),
  colSpan: z.number().min(1).max(4).default(2),
  rowSpan: z.number().min(1).max(6).default(3),
});

type InternalFaqFormData = z.infer<typeof _internalFaqSchema>;
type FaqEditorFormData = z.infer<typeof faqSchema>;

interface FaqEditorProps {
  content?: Link | null;
  onSave: (data: FaqEditorFormData) => void;
  onCancel: () => void;
}

function parseExistingItems(content?: Link | null): { question: string; answer: string }[] {
  if (!content?.content) return [{ question: '', answer: '' }];
  try {
    const parsed = JSON.parse(content.content);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return [{ question: '', answer: '' }];
  } catch {
    return [{ question: '', answer: '' }];
  }
}

export function FaqEditor({ content, onSave, onCancel }: FaqEditorProps) {
  const defaultItems = parseExistingItems(content);

  const form = useForm<InternalFaqFormData>({
    resolver: zodResolver(_internalFaqSchema),
    defaultValues: {
      title: content?.title || 'FAQ',
      items: defaultItems,
      colSpan: content?.colSpan ?? 2,
      rowSpan: content?.rowSpan ?? 3,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const handleSubmit = (data: InternalFaqFormData) => {
    onSave({
      title: data.title || 'FAQ',
      content: JSON.stringify(data.items),
      colSpan: data.colSpan,
      rowSpan: data.rowSpan,
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
              <FormLabel>Card Title</FormLabel>
              <FormControl>
                <Input placeholder="FAQ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Questions &amp; Answers</FormLabel>
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border p-3 space-y-3 relative">
              <FormField
                control={form.control}
                name={`items.${index}.question`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Question {index + 1}</FormLabel>
                    <FormControl>
                      <Input placeholder="What is your return policy?" {...f} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.answer`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Answer</FormLabel>
                    <FormControl>
                      <Textarea placeholder="We offer a 30-day return policy..." rows={2} {...f} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}

          {fields.length < 8 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => append({ question: '', answer: '' })}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          )}
        </div>

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
                  <Slider min={1} max={6} step={1} defaultValue={[field.value]} onValueChange={(v) => field.onChange(v[0])} />
                </FormControl>
                <FormDescription>Grid rows (1–6)</FormDescription>
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
