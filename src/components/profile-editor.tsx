'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Page } from '@/lib/types';

const profileSchema = z.object({
  displayName: z.string().min(1, 'Name is required'),
  bio: z.string().max(160, 'Bio cannot be longer than 160 characters.').optional(),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
});

interface ProfileEditorProps {
  page: Partial<Page>;
  onSave: (data: z.infer<typeof profileSchema>) => void;
  onCancel: () => void;
}

export function ProfileEditor({ page, onSave, onCancel }: ProfileEditorProps) {
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: page.displayName || '',
      bio: page.bio || '',
      slug: page.slug || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unique URL (Slug)</FormLabel>
               <div className="flex items-center">
                  <span className="text-sm text-muted-foreground px-3 py-2 bg-muted rounded-l-md border border-r-0">biobloom.co/</span>
                  <FormControl>
                    <Input {...field} className="rounded-l-none" />
                  </FormControl>
               </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
