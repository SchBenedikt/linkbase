'use client';

import React, { useMemo } from 'react';
import { GripVertical, MoreVertical, Trash2, Edit, ArrowRight } from 'lucide-react';
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
    return query(collection(firestore, 'posts'), where('ownerId', '==', ownerId), where('status', '==', 'published'));
  }, [firestore, ownerId]);

  const { data: fetchedPosts, isLoading } = useCollection<Post>(postsQuery);

  const posts = useMemo(() => {
    if (!fetchedPosts) return [];
    return fetchedPosts
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [fetchedPosts]);

  const cardStyle: React.CSSProperties = {
    borderWidth: `${appearance.borderWidth || 0}px`,
    borderColor: appearance.borderColor,
    borderStyle: appearance.borderWidth ? 'solid' : 'none',
  };
  if (!appearance.borderWidth) cardStyle.borderWidth = '0px';

  const textStyle: React.CSSProperties = { color: appearance.cardForegroundColor || '#FFFFFF' };
  const textMutedStyle: React.CSSProperties = { color: appearance.cardForegroundColor || '#FFFFFF', opacity: 0.65 };

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 ease-in-out bg-card flex flex-col w-full h-full p-5"
      style={cardStyle}
    >
      <CardHeader className="p-0 mb-4">
        <CardTitle style={textStyle}>{link.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-5 w-3/4 bg-foreground/20" />
            <Skeleton className="h-5 w-1/2 bg-foreground/20" />
            <Skeleton className="h-5 w-2/3 bg-foreground/20" />
          </div>
        )}
        {!isLoading && posts.length > 0 && (
          <ul className="space-y-3">
            {posts.map(post => (
              <li key={post.id}>
                <Link
                  href={`/post/${post.id}`}
                  className="flex items-start gap-3 group/item"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* Cover image thumbnail */}
                  {post.coverImage ? (
                    <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-white/10">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded flex items-center justify-center text-lg font-bold"
                      style={{ background: 'rgba(255,255,255,0.1)', color: appearance.cardForegroundColor }}
                    >
                      {post.title?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium text-sm leading-snug line-clamp-2 group-hover/item:underline"
                      style={textStyle}
                    >
                      {post.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {post.category && (
                        <Badge variant="secondary" className="text-xs py-0 px-1.5 hidden sm:inline-flex">
                          {post.category}
                        </Badge>
                      )}
                      {link.showCreationDate !== false && post.createdAt?.toDate && (
                        <span className="text-xs" style={textMutedStyle}>
                          {format(post.createdAt.toDate(), 'MMM d')}
                        </span>
                      )}
                      {post.readingTime && (
                        <span className="text-xs" style={textMutedStyle}>· {post.readingTime}</span>
                      )}
                    </div>
                    {link.showExcerpts && post.excerpt && (
                      <p className="text-xs mt-1 line-clamp-2" style={textMutedStyle}>
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 opacity-0 group-hover/item:opacity-60 transition-opacity mt-0.5" style={textMutedStyle} />
                </Link>
              </li>
            ))}
          </ul>
        )}
        {!isLoading && posts.length === 0 && (
          <p className="text-sm" style={textMutedStyle}>No published posts yet.</p>
        )}
      </CardContent>

      {isEditable && onEdit && onDelete && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="ghost" size="icon" className="h-9 w-9 cursor-grab bg-black/30 hover:bg-black/50 text-white hover:text-white" aria-label="Reorder" {...dragHandleListeners}>
            <GripVertical className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-black/30 hover:bg-black/50 text-white hover:text-white" aria-label="Options">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" /><span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" /><span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </Card>
  );
}
