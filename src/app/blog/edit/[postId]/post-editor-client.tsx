'use client';

import { useEffect, useState, useTransition, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, addDoc, setDoc, serverTimestamp, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserNav } from '@/components/user-nav';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarIcon, Eye, EyeOff, Sparkles, Save } from 'lucide-react';
import type { Post, Page } from '@/lib/types';
import Link from 'next/link';
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
  category: z.string().optional(),
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

export default function PostEditorPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [isSaving, startSaving] = useTransition();
    const [isPublishing, startPublishing] = useTransition();
    const [isUnpublishing, startUnpublishing] = useTransition();
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const postId = params.postId as string;
    const isNewPost = postId === 'new';

    const postRef = useMemoFirebase(() =>
        firestore && !isNewPost ? doc(firestore, 'posts', postId) : null,
        [firestore, postId, isNewPost]
    );

    const { data: post, isLoading: isPostLoading } = useDoc<Post>(postRef);

    const form = useForm<PostFormData>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: '',
            content: '',
            excerpt: '',
            category: '',
            coverImage: '',
            createdAt: new Date(),
        },
    });

    const contentValue = form.watch('content');
    const coverImageValue = form.watch('coverImage');
    const wordCount = countWords(contentValue || '');
    const readingTimeDisplay = calcReadingTime(contentValue || '');

    useEffect(() => {
        if (post) {
            form.reset({
                title: post.title,
                content: post.content,
                excerpt: post.excerpt || '',
                category: post.category || '',
                coverImage: post.coverImage || '',
                createdAt: post.createdAt?.toDate ? post.createdAt.toDate() : new Date(post.createdAt),
            });
        }
    }, [post, form]);

    const buildPostData = useCallback(async (data: PostFormData, status: 'draft' | 'published') => {
        let authorInfo: Partial<Post> = {};
        if (status === 'published' && user && firestore) {
            try {
                const pagesQuery = query(collection(firestore, 'pages'), where('ownerId', '==', user.uid), limit(1));
                const pagesSnap = await getDocs(pagesQuery);
                if (!pagesSnap.empty) {
                    const pageData = pagesSnap.docs[0].data() as Page;
                    authorInfo = {
                        authorName: [pageData.firstName, pageData.lastName].filter(Boolean).join(' '),
                        authorAvatarUrl: pageData.avatarUrl,
                        authorPageSlug: pageData.slug,
                    };
                }
            } catch (e) {
                console.error("Could not fetch author page data", e);
            }
        }
        const autoExcerpt = data.content.substring(0, 250).replace(/\s+/g, ' ').trim() + (data.content.length > 250 ? '\u2026' : '');
        return {
            ...data,
            ...authorInfo,
            readingTime: calcReadingTime(data.content),
            excerpt: data.excerpt && data.excerpt.trim() ? data.excerpt : autoExcerpt,
        };
    }, [user, firestore]);

    const handleSave = async (data: PostFormData, status?: 'draft' | 'published') => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const currentStatus = status || post?.status || 'draft';
        const enrichedData = await buildPostData(data, currentStatus);

        if (isNewPost) {
            try {
                const newPostData = {
                    ...enrichedData,
                    ownerId: user.uid,
                    pageId: 'default',
                    slug: data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                    status: currentStatus,
                    createdAt: data.createdAt || serverTimestamp(),
                    updatedAt: serverTimestamp(),
                };
                const docRef = await addDoc(collection(firestore, 'posts'), newPostData);
                setLastSaved(new Date());
                toast({ title: 'Post created!', description: 'Your post has been saved.' });
                router.replace(`/blog/edit/${docRef.id}`);
            } catch (error) {
                console.error("Error creating post:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not create post.' });
            }
        } else if (postRef) {
            try {
                const updatedData: Record<string, any> = {
                    ...enrichedData,
                    status: currentStatus,
                    updatedAt: serverTimestamp(),
                };
                if (data.createdAt) updatedData.createdAt = data.createdAt;
                await setDoc(postRef, updatedData, { merge: true });
                setLastSaved(new Date());
                toast({ title: 'Post updated!', description: `Your post is now ${currentStatus}.` });
                if (currentStatus === 'published') router.push('/blog');
            } catch (error) {
                console.error("Error updating post:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not update post.' });
            }
        }
    };

    // Autosave draft 30s after last change (existing posts only)
    useEffect(() => {
        if (isNewPost) return;
        const subscription = form.watch(() => {
            if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
            autosaveTimerRef.current = setTimeout(async () => {
                const isValid = await form.trigger(['title', 'content']);
                if (isValid && postRef && firestore) {
                    const data = form.getValues();
                    const enriched = await buildPostData(data, post?.status || 'draft');
                    setDoc(postRef, { ...enriched, updatedAt: serverTimestamp() }, { merge: true })
                        .then(() => setLastSaved(new Date()))
                        .catch(() => {});
                }
            }, 30000);
        });
        return () => {
            subscription.unsubscribe();
            if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
        };
    }, [form, isNewPost, postRef, firestore, post?.status, buildPostData]);

    const onSaveDraft = (data: PostFormData) => startSaving(() => handleSave(data, 'draft'));
    const onPublish = (data: PostFormData) => startPublishing(() => handleSave(data, 'published'));
    const onUnpublish = (data: PostFormData) => startUnpublishing(() => handleSave(data, 'draft'));

    const handleAutoExcerpt = () => {
        const content = form.getValues('content');
        if (!content) return;
        const auto = content.substring(0, 250).replace(/\s+/g, ' ').trim() + (content.length > 250 ? '\u2026' : '');
        form.setValue('excerpt', auto, { shouldDirty: true });
    };

    const isLoading = isUserLoading || (isPostLoading && !isNewPost);
    const isAnyPending = isSaving || isPublishing || isUnpublishing;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        );
    }

    return (
        <Form {...form}>
            <div className="min-h-screen bg-background">
                <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                        <DashboardNav />
                        <div className="flex items-center gap-2 sm:gap-3">
                            {lastSaved && (
                                <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                                    <Save className="h-3 w-3" />
                                    Saved {format(lastSaved, 'HH:mm')}
                                </span>
                            )}
                            {post?.status === 'published' ? (
                                <Button type="button" variant="outline" size="sm" disabled={isAnyPending} onClick={form.handleSubmit(onUnpublish)}>
                                    {isUnpublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <EyeOff className="mr-2 h-4 w-4" />}
                                    Unpublish
                                </Button>
                            ) : (
                                <Button type="button" variant="outline" size="sm" disabled={isAnyPending} onClick={form.handleSubmit(onSaveDraft)}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isNewPost ? 'Save Draft' : 'Save Changes'}
                                </Button>
                            )}
                            <Button type="button" size="sm" disabled={isAnyPending} onClick={form.handleSubmit(onPublish)}>
                                {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                                {post?.status === 'published' ? 'Update Post' : 'Publish'}
                            </Button>
                            <ThemeToggle />
                            <UserNav />
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        className="text-3xl font-extrabold resize-none bg-transparent border-none shadow-none p-0 focus-visible:ring-0 leading-tight placeholder:text-muted-foreground/40"
                                                        rows={2}
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
                                                    <FormLabel className="text-xs text-muted-foreground">Content</FormLabel>
                                                    <span className="text-xs text-muted-foreground">
                                                        {wordCount} words · {readingTimeDisplay}
                                                    </span>
                                                </div>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Write your story…"
                                                        {...field}
                                                        className="text-base resize-none min-h-[420px] bg-transparent border-none shadow-none p-0 focus-visible:ring-0 leading-relaxed placeholder:text-muted-foreground/40"
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
                                        <Badge variant={post?.status === 'published' ? 'default' : 'secondary'} className="capitalize text-sm">
                                            {post?.status || 'draft'}
                                        </Badge>
                                        <p className="text-sm text-muted-foreground">
                                            {post?.status === 'published' ? 'Visible on your public blog.' : 'Saved as a private draft.'}
                                        </p>
                                    </div>
                                    {!isNewPost && post?.id && post.status === 'published' && (
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/post/${post.id}`} target="_blank">
                                                <Eye className="mr-2 h-4 w-4" />
                                                View live post
                                            </Link>
                                        </Button>
                                    )}
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Technology" {...field} />
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
                        </div>
                    </form>
                </main>
            </div>
        </Form>
    );
}
