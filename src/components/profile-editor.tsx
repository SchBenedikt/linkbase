'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Page } from '@/lib/types';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Trash2 } from 'lucide-react';

export const profileSchema = z.object({
  displayName: z.string().min(1, 'Name is required'),
  bio: z.string().max(160, 'Bio cannot be longer than 160 characters.').optional(),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
  avatarUrl: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
  openForWork: z.boolean().optional(),
  category: z.string().optional(),
  socialLinks: z.array(z.object({
    platform: z.string().min(1, "Platform is required."),
    url: z.string().url("Please enter a valid URL.").or(z.literal('')),
  })).optional(),
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
      avatarUrl: page.avatarUrl || '',
      openForWork: page.openForWork || false,
      category: page.category || '',
      socialLinks: page.socialLinks || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks"
  });

  const availablePlatforms = ["instagram", "x", "facebook", "linkedin", "tiktok", "github", "youtube", "website"];

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
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL</FormLabel>
              <FormControl>
                <Input placeholder="https://images.unsplash.com/..." {...field} />
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
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category / Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Photographer, Tech Enthusiast" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="openForWork"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
              <div className="space-y-0.5">
                <FormLabel>Open for work</FormLabel>
                <FormDescription>
                  Show a badge on your profile that you are available for hire.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

         <div>
            <FormLabel>Social Links</FormLabel>
            <div className="space-y-4 pt-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <FormField
                            control={form.control}
                            name={`socialLinks.${index}.platform`}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Platform" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {availablePlatforms.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`socialLinks.${index}.url`}
                            render={({ field }) => (
                                <FormControl>
                                    <Input {...field} placeholder="https://..." className="flex-1" />
                                </FormControl>
                            )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ platform: '', url: '' })}
                >
                    Add Social Link
                </Button>
            </div>
        </div>

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
