'use client';

import { useMemo } from 'react';
import { GripVertical, MoreVertical, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { format } from 'date-fns';

import type { Link as LinkType, AppearanceSettings, Post } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';

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
  
  const postsQuery = useMemoFirebase(() => {
    if (!firestore || !ownerId) return null;
      return query(collection(firestore, 'posts'), where('ownerId', '==', ownerId));
  }, [firestore, ownerId]);

  const { data: fetchedPosts, isLoading } = useCollection<Post>(postsQuery);

  const posts = useMemo(() => {
    if (!fetchedPosts) return [];
    
    const relevantPosts = fetchedPosts.filter(p => p.status === 'published');

    return relevantPosts
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return dateB - dateA; // Sort descending
      })
      .slice(0, 5);
  }, [fetchedPosts]);

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
            {!isLoading && posts && posts.length > 0 && (
                <ul className="space-y-3">
                    {posts.map(post => (
                        <li key={post.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                             <Link href={`/post/${post.id}`} className="hover:underline flex-grow truncate" style={textStyle} target="_blank" rel="noopener noreferrer">
                                {post.title}
                            </Link>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {post.category && <Badge variant="secondary" className="hidden sm:inline-flex">{post.category}</Badge>}
                                {link.showCreationDate !== false && post.createdAt?.toDate && (
                                     <span className="text-xs" style={textMutedStyle}>
                                        {format(post.createdAt.toDate(), 'MMM d')}
                                    </span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {!isLoading && (!posts || posts.length === 0) && (
                <p style={textMutedStyle}>No published posts yet.</p>
            )}
        </CardContent>

        {isEditable && onEdit && onDelete && (
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
  );
}
