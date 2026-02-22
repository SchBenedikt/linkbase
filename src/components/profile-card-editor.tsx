'use client';

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import type { Link, Page } from '@/lib/types';
import { Slider } from './ui/slider';
import { searchPages } from '@/lib/actions';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Loader2 } from 'lucide-react';

export const profileCardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  mentionedPageId: z.string().min(1, 'You must select a profile to feature.'),
  colSpan: z.number().min(1).max(4).default(2),
  rowSpan: z.number().min(1).max(2).default(1),
});

type ProfileCardFormData = z.infer<typeof profileCardSchema>;
type SearchResult = Pick<Page, 'id' | 'firstName' | 'lastName' | 'avatarUrl' | 'slug'>;

interface ProfileCardEditorProps {
  content?: Link | null;
  onSave: (data: ProfileCardFormData) => void;
  onCancel: () => void;
}

export function ProfileCardEditor({ content, onSave, onCancel }: ProfileCardEditorProps) {
  const [isSearching, startSearchTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<SearchResult | null>(null);

  const form = useForm<ProfileCardFormData>({
    resolver: zodResolver(profileCardSchema),
    defaultValues: {
      title: content?.title || 'Featured Profile',
      mentionedPageId: content?.mentionedPageId || '',
      colSpan: content?.colSpan || 2,
      rowSpan: content?.rowSpan || 1,
    },
  });

  useEffect(() => {
    // If editing, we can't easily get the profile info, so user has to re-search
    if (content?.mentionedPageId) {
        form.setValue('mentionedPageId', content.mentionedPageId);
    }
  }, [content, form]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.length > 1) {
        startSearchTransition(async () => {
          const results = await searchPages(searchTerm);
          setSearchResults(results);
        });
      } else {
        setSearchResults([]);
      }
    }, 500); // Debounce search

    return () => clearTimeout(handler);
  }, [searchTerm]);
  
  const handleSelectProfile = (profile: SearchResult) => {
    form.setValue('mentionedPageId', profile.id, { shouldValidate: true });
    setSelectedProfile(profile);
    setSearchTerm('');
    setSearchResults([]);
  };

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
          name="mentionedPageId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Search for a user</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="@username" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoComplete="off"
                  />
                  {isSearching && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
                </div>
              </FormControl>
               <FormDescription>
                {selectedProfile ? `Selected: ${selectedProfile.firstName} ${selectedProfile.lastName} (@${selectedProfile.slug})` : 'Start typing to search for a user.'}
               </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {searchResults.length > 0 && (
          <div className="space-y-2 rounded-md border max-h-48 overflow-y-auto">
            {searchResults.map(profile => (
              <div key={profile.id} onClick={() => handleSelectProfile(profile)} className="flex items-center gap-3 p-2 hover:bg-accent cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.avatarUrl} />
                  <AvatarFallback>{profile.firstName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{profile.firstName} {profile.lastName}</p>
                  <p className="text-sm text-muted-foreground">@{profile.slug}</p>
                </div>
              </div>
            ))}
          </div>
        )}

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
