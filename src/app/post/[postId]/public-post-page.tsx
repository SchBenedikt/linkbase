'use client';

import type { Post } from '@/lib/types';
import { format } from 'date-fns';
import { ArrowLeft, Clock, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import JsonLdScript from '@/components/json-ld-script';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

type PublicPost = Omit<Post, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
};

type PublicPostPageComponentProps = {
    post: PublicPost;
    authorName: string;
    publicUrl: string;
};

export default function PublicPostPageComponent({ post, authorName, publicUrl }: PublicPostPageComponentProps) {
    const publicationDate = post.createdAt ? format(new Date(post.createdAt), 'PPP') : '';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': post.title,
        'author': { '@type': 'Person', 'name': authorName },
        'publisher': { '@type': 'Organization', 'name': 'Linkbase' },
        'datePublished': post.createdAt,
        'dateModified': post.updatedAt,
        'mainEntityOfPage': { '@type': 'WebPage', '@id': publicUrl },
        'articleBody': post.content,
        ...(post.coverImage ? { 'image': post.coverImage } : {}),
    };

    const authorInitial = authorName?.charAt(0)?.toUpperCase() || 'A';

    return (
        <div className="bg-background min-h-screen">
            <JsonLdScript data={jsonLd} />

            <header className="py-4 border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={post.authorPageSlug ? `/${post.authorPageSlug}` : '/blog'}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {post.authorPageSlug ? 'Back to profile' : 'Back to Blog'}
                        </Link>
                    </Button>
                    <Button variant="link" asChild className="font-headline font-bold text-xl text-primary">
                        <Link href="/">Linkbase*</Link>
                    </Button>
                </div>
            </header>

            {/* Cover image */}
            {post.coverImage && (
                <div className="w-full h-64 sm:h-80 md:h-96 overflow-hidden">
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <article className="max-w-3xl mx-auto">
                    <header className="mb-8">
                        {post.category && <Badge className="mb-4">{post.category}</Badge>}
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-foreground leading-tight">
                            {post.title}
                        </h1>

                        {/* Author + meta row */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <Link
                                href={post.authorPageSlug ? `/${post.authorPageSlug}` : '#'}
                                className="flex items-center gap-2 hover:text-foreground transition-colors"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={post.authorAvatarUrl} />
                                    <AvatarFallback>{authorInitial}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{authorName}</span>
                            </Link>
                            <span>&middot;</span>
                            <span>{publicationDate}</span>
                            {post.readingTime && (
                                <>
                                    <span>&middot;</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {post.readingTime}
                                    </span>
                                </>
                            )}
                        </div>

                        {post.excerpt && (
                            <p className="mt-6 text-xl text-muted-foreground leading-relaxed border-l-4 border-primary pl-4">
                                {post.excerpt}
                            </p>
                        )}
                    </header>

                    <Separator className="my-8" />

                    {/* Content – preserve line breaks, render paragraphs */}
                    <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground">
                        {(post.content || '').split(/\n{2,}/).map((paragraph, i) => (
                            <p key={i} className="text-lg leading-relaxed mb-5 text-foreground">
                                {paragraph.split('\n').map((line, j, arr) => (
                                    <span key={j}>
                                        {line}
                                        {j < arr.length - 1 && <br />}
                                    </span>
                                ))}
                            </p>
                        ))}
                    </div>

                    <Separator className="my-12" />

                    {/* Author footer */}
                    <div className="flex items-center gap-4 p-6 rounded-xl border bg-card">
                        <Link href={post.authorPageSlug ? `/${post.authorPageSlug}` : '#'}>
                            <Avatar className="h-14 w-14">
                                <AvatarImage src={post.authorAvatarUrl} />
                                <AvatarFallback className="text-lg">{authorInitial}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Written by</p>
                            <Link
                                href={post.authorPageSlug ? `/${post.authorPageSlug}` : '#'}
                                className="font-semibold text-foreground hover:underline"
                            >
                                {authorName}
                            </Link>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
