'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from './ui/slider';
import type { Link } from '@/lib/types';

export const countdownSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  countdownTarget: z.string().min(1, 'Target date is required'),
  colSpan: z.number().min(1).max(4).default(2),
  rowSpan: z.number().min(1).max(2).default(1),
});

type CountdownEditorFormData = z.infer<typeof countdownSchema>;

interface CountdownEditorProps {
  content?: Link | null;
  onSave: (data: CountdownEditorFormData) => void;
  onCancel: () => void;
}

export function CountdownEditor({ content, onSave, onCancel }: CountdownEditorProps) {
  // Convert ISO string or datetime-local string to datetime-local format
  const toDatetimeLocal = (val?: string): string => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      // Format: YYYY-MM-DDTHH:mm
      return d.toISOString().slice(0, 16);
    } catch {
      return val;
    }
  };

  const form = useForm<CountdownEditorFormData>({
    resolver: zodResolver(countdownSchema),
    defaultValues: {
      title: content?.title || 'Countdown',
      countdownTarget: toDatetimeLocal(content?.countdownTarget) || '',
      colSpan: content?.colSpan || 2,
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
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Launch Day!" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="countdownTarget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Date &amp; Time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormDescription>The date and time to count down to.</FormDescription>
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
            {content ? 'Cancel' : 'Back'}
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
