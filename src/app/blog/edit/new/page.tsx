'use client';

import { Suspense } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ClientOnly } from '@/components/client-only';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function NewPostContent() {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const handleSave = async (postData: any) => {
    if (!firestore || !user) {
      throw new Error('Not authenticated or Firebase not available');
    }

    try {
      // Create a new post document with proper collection structure
      const postsCollection = collection(firestore, 'posts');
      const newPostRef = doc(postsCollection);
      
      const postToSave = {
        title: postData.title || '',
        content: postData.content || '',
        slug: postData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '',
        excerpt: postData.content?.substring(0, 200) || '',
        authorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        published: false, // Start as draft
        tags: [],
        featuredImage: '',
      };

      await setDoc(newPostRef, postToSave);
      
      // Redirect to the edit page
      router.push(`/blog/edit/${newPostRef.id}`);
      return newPostRef.id;
    } catch (error) {
      console.error('Error creating new post:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
          <p className="text-muted-foreground">Start writing your new blog post</p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">Title</label>
                <input
                  id="title"
                  type="text"
                  placeholder="Enter post title..."
                  className="w-full p-3 border rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  id="content"
                  placeholder="Start writing your post..."
                  rows={10}
                  className="w-full p-3 border rounded-md"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const title = (document.getElementById('title') as HTMLInputElement)?.value || '';
                    const content = (document.getElementById('content') as HTMLTextAreaElement)?.value || '';
                    
                    if (!title || !content) {
                      alert('Please fill in both title and content');
                      return;
                    }
                    
                    handleSave({ title, content });
                  }}
                >
                  Save Post
                </Button>
                
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
