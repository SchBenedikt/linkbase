'use client';

import type { Post } from '@/lib/types';
import { format } from 'date-fns';
import { ArrowLeft, Clock, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import JsonLdScript from '@/components/json-ld-script';
import { BreadcrumbSchema } from '@/components/breadcrumb-schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

type PublicPost = Omit<Post, 'createdAt' | 'updatedAt'> & {
    createdAt: string | Date | { toDate: () => Date };
    updatedAt: string | Date | { toDate: () => Date };
};

type PublicPostPageComponentProps = {
    post: PublicPost;
    authorName: string;
    authorBio?: string;
    publicUrl: string;
};

export default function PublicPostPageComponent({ post, authorName, authorBio, publicUrl }: PublicPostPageComponentProps) {
    const router = useRouter();
    
    const publicationDate = post.createdAt ? format(
        post.createdAt instanceof Date ? post.createdAt : 
        (typeof post.createdAt === 'object' && 'toDate' in post.createdAt) ? (post.createdAt as any).toDate() : 
        new Date(post.createdAt as string), 
        'PPP'
    ) : '';

    const handleBack = () => {
        // Use browser's back functionality to go to the previous page
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
        } else {
            // Fallback to blog if no history
            router.push('/blog');
        }
    };

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': post.title,
        'author': { 
            '@type': 'Person', 
            'name': authorName,
            ...(post.authorAvatarUrl && { 'image': post.authorAvatarUrl }),
            ...(authorBio && { 'description': authorBio }),
            ...(post.authorPageSlug && { 'url': `${process.env.NEXT_PUBLIC_SITE_URL}/${post.authorPageSlug}` })
        },
        'publisher': { 
            '@type': 'Organization', 
            'name': 'Linkbase',
            'url': process.env.NEXT_PUBLIC_SITE_URL,
            'logo': {
                '@type': 'ImageObject',
                'url': `${process.env.NEXT_PUBLIC_SITE_URL}/icon.svg`
            }
        },
        'datePublished': post.createdAt instanceof Date ? post.createdAt.toISOString() : 
                       (typeof post.createdAt === 'object' && 'toDate' in post.createdAt) ? (post.createdAt as any).toDate().toISOString() : 
                       new Date(post.createdAt as string).toISOString(),
        'dateModified': post.updatedAt instanceof Date ? post.updatedAt.toISOString() : 
                       (typeof post.updatedAt === 'object' && 'toDate' in post.updatedAt) ? (post.updatedAt as any).toDate().toISOString() : 
                       new Date(post.updatedAt as string).toISOString(),
        'mainEntityOfPage': { '@type': 'WebPage', '@id': publicUrl },
        'articleBody': post.content,
        ...(post.coverImage ? { 
            'image': {
                '@type': 'ImageObject',
                'url': post.coverImage,
                'width': 1200,
                'height': 630
            }
        } : {}),
        ...(post.excerpt && { 'description': post.excerpt }),
        ...(post.readingTime && { 'timeRequired': `PT${post.readingTime}` }),
        ...(post.categories && post.categories.length > 0 && { 
            'about': post.categories.map(category => ({
                '@type': 'Thing',
                'name': category
            }))
        }),
        'isAccessibleForFree': true,
        'isPartOf': {
            '@type': 'Blog',
            'name': 'Linkbase Blog',
            'url': `${process.env.NEXT_PUBLIC_SITE_URL}/blog`
        }
    };

    const authorInitial = authorName?.charAt(0)?.toUpperCase() || 'A';

    // Breadcrumb items for structured data
    const breadcrumbItems = [
        { name: 'Home', url: process.env.NEXT_PUBLIC_SITE_URL || '/' },
        { name: 'Blog', url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog` },
        { name: post.title, url: publicUrl }
    ];

    return (
        <div className="bg-background min-h-screen">
            <JsonLdScript data={jsonLd} />
            <BreadcrumbSchema items={breadcrumbItems} />

            <header className="py-4 border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <Button variant="outline" size="sm" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
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
                        {post.categories && post.categories.length > 0 && (
                            <div className="mb-4">
                                {post.categories.map((category, index) => (
                                    <Badge key={index} className="mr-2">{category}</Badge>
                                ))}
                            </div>
                        )}
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
                    <div className="flex items-start gap-4 p-6 rounded-xl border bg-card">
                        <Link href={post.authorPageSlug ? `/${post.authorPageSlug}` : '#'}>
                            <Avatar className="h-14 w-14">
                                <AvatarImage src={post.authorAvatarUrl} />
                                <AvatarFallback className="text-lg">{authorInitial}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Written by</p>
                            <Link
                                href={post.authorPageSlug ? `/${post.authorPageSlug}` : '#'}
                                className="font-semibold text-foreground hover:underline"
                            >
                                {authorName}
                            </Link>
                            {authorBio && (
                                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                    {authorBio}
                                </p>
                            )}
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
