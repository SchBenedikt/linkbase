'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientOnly } from '@/components/client-only';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

function NewPostContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (postData: any) => {
    try {
      setLoading(true);
      setError(null);

      // Dynamically import and initialize Firebase
      const { initializeFirebase } = await import('@/firebase');
      const firebaseServices = initializeFirebase();
      
      if (!firebaseServices.firestore || !firebaseServices.auth) {
        throw new Error('Firebase not properly initialized');
      }

      // Check if user is authenticated
      const { onAuthStateChanged } = await import('firebase/auth');
      return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(firebaseServices.auth, (user) => {
          unsubscribe();
          if (!user) {
            reject(new Error('User not authenticated'));
            return;
          }

          // Create a new post document
          createPost(firebaseServices.firestore, user, postData)
            .then(resolve)
            .catch(reject);
        });
      });

    } catch (error) {
      console.error('Error creating new post:', error);
      setError('Failed to create post. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (firestore: any, user: any, postData: any) => {
    const { doc, setDoc, serverTimestamp, collection } = await import('firebase/firestore');
    
    const postsCollection = collection(firestore, 'posts');
    const postId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const newPostRef = doc(postsCollection, postId);
    
    const postToSave = {
      id: postId,
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
              {error && (
                <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">Title</label>
                <input
                  id="title"
                  type="text"
                  placeholder="Enter post title..."
                  className="w-full p-3 border rounded-md"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  id="content"
                  placeholder="Start writing your post..."
                  rows={10}
                  className="w-full p-3 border rounded-md"
                  disabled={loading}
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
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Save Post'
                  )}
                </Button>
                
                <Button variant="outline" onClick={() => router.push('/dashboard')} disabled={loading}>
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
