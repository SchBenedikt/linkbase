'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, addDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserNav } from '@/components/user-nav';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { Post } from '@/lib/types';
import Link from 'next/link';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  content: z.string().min(1, 'Content is required.'),
});

type PostFormData = z.infer<typeof postSchema>;

export default function PostEditorPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [isSaving, startSaving] = useTransition();
    const [isPublishing, startPublishing] = useTransition();

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
        },
    });

    useEffect(() => {
        if (post) {
            form.reset({
                title: post.title,
                content: post.content,
            });
        }
    }, [post, form]);

    const handleSave = async (data: PostFormData, status?: 'draft' | 'published') => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const currentStatus = status || post?.status || 'draft';

        if (isNewPost) {
            try {
                const newPostData = {
                    ...data,
                    ownerId: user.uid,
                    pageId: 'default', // TODO: Allow selecting a page
                    slug: data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                    status: currentStatus,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                };
                const docRef = await addDoc(collection(firestore, 'posts'), newPostData);
                toast({ title: 'Post created!', description: 'Your post has been saved as a draft.' });
                router.replace(`/blog/edit/${docRef.id}`);
            } catch (error) {
                console.error("Error creating post:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not create post.' });
            }
        } else if(postRef) {
            try {
                const updatedData: Partial<Post> = {
                    ...data,
                    status: currentStatus,
                    updatedAt: serverTimestamp(),
                };
                await setDoc(postRef, updatedData, { merge: true });
                toast({ title: 'Post updated!', description: `Your post is now ${currentStatus}.` });
                if (currentStatus === 'published') {
                  router.push('/blog');
                }
            } catch (error) {
                console.error("Error updating post:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not update post.' });
            }
        }
    };

    const onSaveDraft = (data: PostFormData) => {
        startSaving(() => handleSave(data, 'draft'));
    };

    const onPublish = (data: PostFormData) => {
        startPublishing(() => handleSave(data, 'published'));
    };

    const isLoading = isUserLoading || (isPostLoading && !isNewPost);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-[#f3f3f1]">
            <header className="bg-[#f3f3f1]/80 backdrop-blur-md border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                     <Button variant="outline" size="sm" asChild>
                        <Link href="/blog">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Blog
                        </Link>
                    </Button>
                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isSaving || isPublishing}
                            onClick={form.handleSubmit(onSaveDraft)}
                        >
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isNewPost ? 'Save Draft' : 'Save Changes'}
                        </Button>
                        <Button
                            type="button"
                            disabled={isSaving || isPublishing}
                            onClick={form.handleSubmit(onPublish)}
                        >
                            {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {post?.status === 'published' ? 'Update Post' : 'Publish'}
                        </Button>
                        <UserNav />
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form>
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <Textarea
                                placeholder="Post Title"
                                {...form.register('title')}
                                className="text-4xl font-extrabold border-0 shadow-none resize-none p-0 focus-visible:ring-0 bg-transparent"
                            />
                            {form.formState.errors.title && <p className="text-destructive mt-2">{form.formState.errors.title.message}</p>}
                        </div>
                        <div className="mb-8">
                            <Textarea
                                placeholder="Write your story..."
                                {...form.register('content')}
                                className="text-lg border-0 shadow-none resize-none p-0 h-96 focus-visible:ring-0 bg-transparent"
                            />
                             {form.formState.errors.content && <p className="text-destructive mt-2">{form.formState.errors.content.message}</p>}
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
