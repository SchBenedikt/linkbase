'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import type { Link, UserProfile } from '@/lib/types';
import { Slider } from './ui/slider';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


export const profileCardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  mentionedUserId: z.string().min(1, 'You must select a profile to feature.'),
  colSpan: z.number().min(1).max(4).default(2),
  rowSpan: z.number().min(1).max(2).default(1),
});

type ProfileCardFormData = z.infer<typeof profileCardSchema>;

interface ProfileCardEditorProps {
  content?: Link | null;
  onSave: (data: ProfileCardFormData) => void;
  onCancel: () => void;
}

export function ProfileCardEditor({ content, onSave, onCancel }: ProfileCardEditorProps) {
  const firestore = useFirestore();

  const profilesQuery = useMemoFirebase(() =>
    firestore ? collection(firestore, 'user_profiles') : null,
    [firestore]
  );
  const { data: allProfiles, isLoading: areProfilesLoading } = useCollection<UserProfile>(profilesQuery);

  const form = useForm<ProfileCardFormData>({
    resolver: zodResolver(profileCardSchema),
    defaultValues: {
      title: content?.title || 'Featured Profile',
      mentionedUserId: content?.mentionedUserId || '',
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
              <FormLabel>Card Title</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="mentionedUserId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Profile to Feature</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={areProfilesLoading || !allProfiles}
                >
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={areProfilesLoading ? "Loading profiles..." : "Select a user"} />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {allProfiles?.map(profile => (
                             <SelectItem key={profile.id} value={profile.id}>
                                {profile.firstName} {profile.lastName} (@{profile.username})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
               <FormDescription>
                Select a user profile to feature on your page.
               </FormDescription>
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
                    <FormControl><Slider min={1} max={4} step={1} defaultValue={[field.value]} onValueChange={(v) => field.onChange(v[0])} /></FormControl>
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
                    <FormControl><Slider min={1} max={2} step={1} defaultValue={[field.value]} onValueChange={(v) => field.onChange(v[0])}/></FormControl>
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
