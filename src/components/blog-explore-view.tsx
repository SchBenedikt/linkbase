'use client';
import { useState, useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Post } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


function PostCard({ post }: { post: Post }) {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                {post.category && <Badge variant="secondary" className="mb-2 w-fit">{post.category}</Badge>}
                <CardTitle className="text-xl font-bold">
                    <Link href={`/post/${post.id}`} className="hover:underline">
                        {post.title}
                    </Link>
                </CardTitle>
                 <CardDescription>{format(new Date(post.createdAt), 'PPP')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-3">
                   {post.content}
                </p>
            </CardContent>
            <CardContent>
                 <Link 
                    href={post.authorPageSlug ? `/${post.authorPageSlug}`: '#'} 
                    className="flex items-center gap-2 group w-fit"
                 >
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={post.authorAvatarUrl} />
                        <AvatarFallback>{post.authorName?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium group-hover:underline">{post.authorName}</span>
                </Link>
            </CardContent>
        </Card>
    );
}

export function BlogExploreView() {
    const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>('All');

    const publicPostsQuery = useMemoFirebase(() => 
        firestore 
        ? query(collection(firestore, 'posts'), where('status', '==', 'published'), orderBy('createdAt', 'desc'))
        : null,
    [firestore]);

    const { data: posts, isLoading } = useCollection<Post>(publicPostsQuery);

    const categories = useMemo(() => {
        if (!posts) return [];
        return ['All', ...[...new Set(posts.map(p => p.category).filter(Boolean))] as string[]];
    }, [posts]);

    const filteredPosts = useMemo(() => {
        if (!posts) return [];
        return posts.filter(post => {
            const matchesCategory = !selectedCategory || selectedCategory === 'All' || post.category === selectedCategory;
            const matchesSearch = searchTerm === '' || post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.authorName?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [posts, searchTerm, selectedCategory]);

    if (isLoading) {
        return (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full mt-2" />
                            <Skeleton className="h-4 w-2/3 mt-2" />
                        </CardContent>
                        <CardContent>
                             <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search posts by title or author..."
                        className="pl-10 max-w-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <div className="flex flex-wrap items-center gap-2">
                    {categories.map(category => (
                        <Badge 
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'secondary'}
                            onClick={() => setSelectedCategory(category)}
                            className="cursor-pointer"
                        >
                            {category}
                        </Badge>
                    ))}
                 </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
            {filteredPosts.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
                    <h3 className="text-xl font-semibold">No posts found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your search or filter.</p>
                </div>
            )}
        </div>
    )
}
