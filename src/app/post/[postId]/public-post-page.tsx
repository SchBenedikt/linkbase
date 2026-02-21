'use client';

import type { Post } from '@/lib/types';
import { format } from 'date-fns';
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type PublicPost = Omit<Post, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
};

type PublicPostPageComponentProps = { 
    post: PublicPost;
    authorName: string;
};


export default function PublicPostPageComponent({ post, authorName }: PublicPostPageComponentProps) {
    
    const publicationDate = post.createdAt ? format(new Date(post.createdAt), 'PPP') : '';
    
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': post.title,
        'author': {
            '@type': 'Person',
            'name': authorName,
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'BioBloom',
        },
        'datePublished': post.createdAt,
        'dateModified': post.updatedAt,
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': typeof window !== 'undefined' ? window.location.href : ''
        },
        'articleBody': post.content,
    };

    return (
        <div className="bg-background min-h-screen">
             <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
             <header className="py-4 border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/blog">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Blog
                        </Link>
                    </Button>
                     <Button variant="link" asChild className="font-headline font-bold text-xl text-primary">
                        <Link href="/">
                           BioBloom*
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <article className="max-w-4xl mx-auto">
                    <header className="mb-8 text-center border-b pb-8">
                        {post.category && <Badge className="mb-4">{post.category}</Badge>}
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-foreground">
                            {post.title}
                        </h1>
                        <div className="flex justify-center items-center gap-2 text-muted-foreground text-base">
                            <UserIcon className="h-4 w-4" />
                            <span>By {authorName}</span>
                            <span>&middot;</span>
                            <span>{publicationDate}</span>
                        </div>
                    </header>
                    <div className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">
                       {post.content}
                    </div>
                </article>
            </main>
        </div>
    );
}
