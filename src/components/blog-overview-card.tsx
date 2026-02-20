'use client';

import { useMemo } from 'react';
import { GripVertical, MoreVertical, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';

import type { Link as LinkType, AppearanceSettings, Post } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';

interface BlogOverviewCardProps {
  link: LinkType;
  ownerId: string;
  onEdit?: () => void;
  onDelete?: () => void;
  appearance: AppearanceSettings;
  isEditable?: boolean;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

export function BlogOverviewCard({ link, ownerId, onEdit, onDelete, appearance, isEditable = false, dragHandleListeners }: BlogOverviewCardProps) {
  const firestore = useFirestore();
  
  // IMPORTANT: Only run the query on the public page (when not editable).
  // In the editor, we just show a placeholder, so no data fetching is needed.
  const postsQuery = useMemoFirebase(() =>
    (!isEditable && firestore) ? query(
        collection(firestore, 'posts'),
        where('status', '==', 'published')
    ) : null,
    [isEditable, firestore]
  );
  const { data: allPublishedPosts, isLoading } = useCollection<Post>(postsQuery);

  // On the client (for the public page), filter all published posts to find the ones for this specific owner.
  const posts = useMemo(() => {
    if (isEditable || !allPublishedPosts || !ownerId) return [];
    return allPublishedPosts
      .filter(p => p.ownerId === ownerId)
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return dateB - dateA; // Sort descending
      })
      .slice(0, 5);
  }, [isEditable, allPublishedPosts, ownerId]);

  const cardStyle: React.CSSProperties = {
    borderWidth: `${appearance.borderWidth || 0}px`,
    borderColor: appearance.borderColor,
    borderStyle: appearance.borderWidth ? 'solid' : 'none',
  };
  
  if (!appearance.borderWidth) {
      cardStyle.borderWidth = '0px';
  }

  const textStyle: React.CSSProperties = {
      color: appearance.cardForegroundColor || '#FFFFFF'
  };

  const textMutedStyle: React.CSSProperties = {
      color: appearance.cardForegroundColor || '#FFFFFF',
      opacity: 0.8,
  };
  
  if (isEditable) {
    // In the editor, show a static placeholder to prevent crashes and unnecessary data loads.
    return (
      <Card 
          className="group relative overflow-hidden transition-all duration-300 ease-in-out bg-card flex flex-col w-full h-full p-5"
          style={cardStyle}
      >
          <CardHeader className="p-0 mb-4">
              <CardTitle style={textStyle}>{link.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-grow">
               <div className="space-y-3">
                  <Skeleton className="h-5 w-3/4 bg-foreground/20" />
                  <Skeleton className="h-5 w-1/2 bg-foreground/20" />
                  <Skeleton className="h-5 w-2/3 bg-foreground/20" />
              </div>
              <p className="text-sm mt-4" style={textMutedStyle}>Your latest blog posts will be shown here on your public page.</p>
          </CardContent>

          {onEdit && onDelete && (
              <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button variant="ghost" size="icon" className="h-9 w-9 cursor-grab bg-black/30 hover:bg-black/50 text-white hover:text-white" aria-label="Reorder link" {...dragHandleListeners}>
                      <GripVertical className="h-5 w-5" />
                  </Button>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 bg-black/30 hover:bg-black/50 text-white hover:text-white" aria-label="Link options">
                              <MoreVertical className="h-5 w-5" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={onEdit}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
              </div>
          )}
      </Card>
    )
  }

  // This is the public view. It uses the data fetched by the hook.
  return (
    <Card 
        className="group relative overflow-hidden transition-all duration-300 ease-in-out bg-card flex flex-col w-full h-full p-5"
        style={cardStyle}
    >
        <CardHeader className="p-0 mb-4">
            <CardTitle style={textStyle}>{link.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-grow">
            {isLoading && (
                <div className="space-y-3">
                    <Skeleton className="h-5 w-3/4 bg-foreground/20" />
                    <Skeleton className="h-5 w-1/2 bg-foreground/20" />
                    <Skeleton className="h-5 w-2/3 bg-foreground/20" />
                </div>
            )}
            {posts && posts.length > 0 && !isLoading && (
                <ul className="space-y-3">
                    {posts.map(post => (
                        <li key={post.id}>
                            <Link href={`/post/${post.id}`} className="hover:underline" style={textStyle} target="_blank">
                                {post.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
            {posts && posts.length === 0 && !isLoading && (
                <p style={textMutedStyle}>No published posts yet.</p>
            )}
        </CardContent>
    </Card>
  );
}
