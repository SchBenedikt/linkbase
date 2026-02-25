'use client';

import { Suspense, useEffect, useState, useTransition, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserNav } from '@/components/user-nav';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarIcon, Eye, Sparkles, Save } from 'lucide-react';
import { ClientOnly } from '@/components/client-only';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { ThemeToggle } from '@/components/theme-toggle';
import { DashboardNav } from '@/components/dashboard-nav';
import { Separator } from '@/components/ui/separator';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  content: z.string().min(1, 'Content is required.'),
  excerpt: z.string().max(300, 'Excerpt cannot be longer than 300 characters.').optional(),
  categories: z.string().optional(),
  coverImage: z.string().optional(),
  createdAt: z.date().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

function calcReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function NewPostContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, startSaving] = useTransition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [firestore, setFirestore] = useState<any>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      categories: '',
      coverImage: '',
      createdAt: new Date(),
    },
  });

  const contentValue = form.watch('content');
  const coverImageValue = form.watch('coverImage');
  const wordCount = countWords(contentValue || '');
  const readingTimeDisplay = calcReadingTime(contentValue || '');

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize Firebase
        const { initializeFirebase } = await import('@/firebase');
        const firebaseServices = initializeFirebase();
        
        if (!firebaseServices.firestore || !firebaseServices.auth) {
          throw new Error('Firebase not properly initialized');
        }

        setFirestore(firebaseServices.firestore);

        // Check authentication
        const { onAuthStateChanged } = await import('firebase/auth');
        const unsubscribe = onAuthStateChanged(firebaseServices.auth, (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
          } else {
            router.push('/login');
          }
          unsubscribe();
        });

      } catch (error) {
        console.error('Error initializing:', error);
        setError('Failed to initialize. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeFirebase();
  }, [router]);

  const handleAutoExcerpt = useCallback(() => {
    const content = form.getValues('content');
    if (!content) return;
    
    const autoExcerpt = content.substring(0, 250).replace(/\s+/g, ' ').trim() + (content.length > 250 ? '…' : '');
    form.setValue('excerpt', autoExcerpt);
  }, [form]);

  const handleSave = async (data: PostFormData, status: 'draft' | 'published' = 'draft') => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
      return;
    }

    startSaving(async () => {
      try {
        const { doc, setDoc, serverTimestamp, collection } = await import('firebase/firestore');
        
        const postsCollection = collection(firestore, 'posts');
        const postId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const newPostRef = doc(postsCollection, postId);
        
        // Get author info
        let authorInfo: any = {};
        try {
          const { doc: docFn, query, collection: collectionFn, where, getDocs, limit, getDoc } = await import('firebase/firestore');
          
          const userProfileRef = docFn(firestore, 'user_profiles', user.uid);
          const pagesQuery = query(collectionFn(firestore, 'pages'), where('ownerId', '==', user.uid), limit(1));
          
          const [profileSnap, pagesSnap] = await Promise.all([
            getDoc(userProfileRef),
            getDocs(pagesQuery)
          ]);
          
          let pageSlug: string | undefined;
          if (!pagesSnap.empty) {
            pageSlug = pagesSnap.docs[0].data().slug;
          }

          if (profileSnap.exists()) {
            const profileData = profileSnap.data();
            authorInfo = {
              authorName: [profileData.firstName, profileData.lastName].filter(Boolean).join(' ') || 'User',
              authorAvatarUrl: profileData.avatarUrl,
              authorPageSlug: pageSlug,
              authorBio: profileData.bio,
            };
          } else if (pageSlug) {
            const pageData = pagesSnap.docs[0].data();
            authorInfo = {
              authorName: [pageData.firstName, pageData.lastName].filter(Boolean).join(' ') || 'User',
              authorAvatarUrl: pageData.avatarUrl,
              authorPageSlug: pageData.slug,
              authorBio: pageData.bio,
            };
          }
        } catch (e) {
          console.error("Could not fetch author data", e);
        }

        const categories = data.categories 
          ? data.categories.split(',').map(cat => cat.trim()).filter(Boolean)
          : [];
        
        const autoExcerpt = data.content.substring(0, 250).replace(/\s+/g, ' ').trim() + (data.content.length > 250 ? '…' : '');
        
        const postToSave = {
          id: postId,
          title: data.title,
          content: data.content,
          slug: data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '',
          excerpt: data.excerpt && data.excerpt.trim() ? data.excerpt : autoExcerpt,
          categories,
          coverImage: data.coverImage,
          ownerId: user.uid,
          pageId: '', // Will be set when user selects a page
          status,
          createdAt: data.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
          readingTime: calcReadingTime(data.content),
          ...authorInfo,
        };

        await setDoc(newPostRef, postToSave);
        setLastSaved(new Date());
        
        toast({ 
          title: 'Success!', 
          description: status === 'published' ? 'Post published successfully!' : 'Post saved as draft.' 
        });

        // Redirect to the edit page
        router.push(`/blog/edit/${newPostRef.id}`);
        
      } catch (error: any) {
        console.error('Error creating post:', error);
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to create post.' });
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <DashboardNav />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserNav />
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <DashboardNav />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserNav />
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <DashboardNav />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
          <p className="text-muted-foreground">Start writing your new blog post</p>
        </div>

        <Form {...form}>
          <form className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        {coverImageValue && (
                          <div className="mt-2 rounded-lg overflow-hidden border aspect-video bg-muted">
                            <img
                              src={coverImageValue}
                              alt="Cover preview"
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Separator />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Post title…"
                          />
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
                        <div className="flex items-center justify-between mb-1">
                          <FormLabel>Content</FormLabel>
                          <span className="text-xs text-muted-foreground">
                            {wordCount} words · {readingTimeDisplay}
                          </span>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Write your story…"
                            {...field}
                            className="min-h-[420px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
              <Card>
                <CardHeader>
                  <CardTitle>Publishing</CardTitle>
                  <CardDescription>Manage visibility and metadata.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize text-sm">
                      draft
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Saved as a private draft.
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="categories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categories</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Technology, Design, Business" {...field} />
                        </FormControl>
                        <FormDescription>Group this post with similar content.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="createdAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publication Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>The date shown as publication date.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Excerpt</CardTitle>
                  <CardDescription>Short summary shown in listings and previews.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Short summary of your post…"
                            {...field}
                            rows={4}
                            className="resize-none"
                          />
                        </FormControl>
                        <FormDescription>{(field.value?.length || 0)}/300 characters</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleAutoExcerpt}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Auto-generate from content
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-3">
                  <Button 
                    type="button" 
                    className="w-full" 
                    onClick={() => {
                      const data = form.getValues();
                      handleSave(data, 'draft');
                    }}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save as Draft
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const data = form.getValues();
                      handleSave(data, 'published');
                    }}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      'Publish Now'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => router.push('/dashboard')}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  {lastSaved && (
                    <p className="text-xs text-muted-foreground text-center">
                      Last saved {format(lastSaved, 'PPP p')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

export default function NewPostPage() {
  return (
    <ClientOnly fallback={<div className="min-h-screen bg-background"></div>}>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_60%)] text-foreground">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        }
      >
        <NewPostContent />
      </Suspense>
    </ClientOnly>
  );
}
