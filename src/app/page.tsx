'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { Palette, Link as LinkIcon, Sparkles, BarChart3, MoveRight, BookOpen, UserPlus, Share2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { UserNav } from '@/components/user-nav';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { HeroShowcase } from '@/components/hero-showcase';
import { BlogShowcase } from '@/components/blog-showcase';

export default function LandingPage() {
  const { user, isUserLoading } = useUser();
  const testimonial1 = PlaceHolderImages.find(p => p.id === 'testimonial-1');
  const testimonial2 = PlaceHolderImages.find(p => p.id === 'testimonial-2');
  const testimonial3 = PlaceHolderImages.find(p => p.id === 'testimonial-3');


  const renderAuthButtons = () => {
    if (isUserLoading) {
        return <Skeleton className="h-10 w-24 rounded-full" />;
    }
    if (user) {
        return (
            <div className="flex items-center gap-2">
                <Button variant="outline" asChild className="rounded-full hidden sm:flex">
                    <Link href="/dashboard">Dashboard</Link>
                </Button>
                <ThemeToggle />
                <UserNav />
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild className="rounded-full hover:bg-accent/80">
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="rounded-full">
                <Link href="/login">Sign up Free</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="text-foreground bg-background flex flex-col min-h-screen">
      <header className="fixed top-4 z-50 w-full px-4">
        <div className="container mx-auto">
          <nav className="bg-background/30 backdrop-blur-md w-full rounded-full border p-2 flex items-center justify-between">
            <Link href="/" className="font-headline font-bold text-xl pl-4 text-primary">
              Linkbase*
            </Link>
            {renderAuthButtons()}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-accent text-accent-foreground min-h-screen flex items-center pt-24 pb-16 px-4">
            <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
                 <div className="flex flex-col gap-6 items-start text-left">
                     <h1 className="font-headline text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tighter leading-tight">
                        One link in bio, made for you.
                    </h1>
                    <p className="max-w-xl text-lg sm:text-xl text-accent-foreground/80">
                        Everything you are, all in one place. Share your creations, your work, and your personality with the world.
                    </p>
                    <form className="w-full max-w-md flex flex-col sm:flex-row gap-2 mt-4">
                        <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-foreground/60">linkbase.pro/</span>
                        <Input
                            type="text"
                            placeholder="your-name"
                            className="w-full h-14 rounded-full pl-32 pr-4 text-base bg-black/5 border-accent-foreground/20 placeholder:text-accent-foreground/50 text-accent-foreground focus:ring-accent-foreground"
                        />
                        </div>
                        <Button asChild size="lg" className="h-14 rounded-full text-base font-bold w-full sm:w-auto px-8">
                            <Link href="/login">Get Started for Free</Link>
                        </Button>
                    </form>
                 </div>
                 <div className="hidden md:flex items-center justify-center">
                    <HeroShowcase />
                 </div>
            </div>
        </section>

        {/* New Bento Grid Section */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter">
                A canvas for your digital world
              </h2>
              <p className="mt-4 text-lg sm:text-xl text-muted-foreground">
                Linkbase gives you all the tools to design a page that is as unique as you are. Flexible, powerful, and beautiful.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 p-8 flex flex-col justify-between bg-primary text-primary-foreground rounded-3xl border-none">
                <div>
                  <div className="p-2 bg-white/10 rounded-full w-fit mb-4">
                    <Palette className="h-6 w-6" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold mb-2">Design without limits</h3>
                  <p className="text-primary-foreground/80 mb-4">Take full control of your page's appearance. Fine-tune every detail from colors and backgrounds to borders and corner radiuses.</p>
                </div>
                <Link href="/login" className="font-semibold inline-flex items-center gap-2 group text-primary-foreground/80 hover:text-primary-foreground">
                  Start designing <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Card>
              <Card className="p-8 flex flex-col justify-between bg-accent text-accent-foreground rounded-3xl border-none">
                <div>
                  <div className="p-2 bg-black/10 rounded-full w-fit mb-4">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold mb-2">AI-powered Magic</h3>
                  <p className="text-accent-foreground/80">Describe your desired aesthetic and let our AI generate stunning, unique themes for you in seconds.</p>
                </div>
              </Card>
              <Card className="p-8 flex flex-col justify-between bg-card text-card-foreground rounded-3xl border">
                 <div>
                   <div className="p-2 bg-foreground/10 rounded-full w-fit mb-4">
                      <LinkIcon className="h-6 w-6" />
                   </div>
                  <h3 className="font-headline text-2xl font-bold mb-2">All your content</h3>
                  <p className="text-muted-foreground">Your central hub for everything you do. Link to socials, embed a Spotify track, or feature another creator's profile.</p>
                </div>
              </Card>
              <Card className="md:col-span-2 p-8 flex flex-col justify-between bg-secondary text-secondary-foreground rounded-3xl border-none">
                <div>
                  <div className="p-2 bg-black/10 rounded-full w-fit mb-4">
                     <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold mb-2">Detailed Analytics</h3>
                  <p className="text-secondary-foreground/80">Our upcoming analytics suite will give you deep insights into your audience. Understand which links get the most clicks and what content truly resonates.</p>
                </div>
                <Link href="/login" className="font-semibold inline-flex items-center gap-2 group text-secondary-foreground/80 hover:text-secondary-foreground">
                  Get insights <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-16 sm:py-24 bg-background text-foreground">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <BlogShowcase />
            </div>
            <div className="order-1 md:order-2 max-w-lg">
                <div className="p-2 bg-foreground/10 rounded-full w-fit mb-4">
                  <BookOpen className="h-6 w-6" />
                </div>
              <h2 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter">
                Share your story with an integrated blog
              </h2>
              <p className="mt-4 text-lg sm:text-xl text-muted-foreground">
                Don't just share links, share your thoughts. Linkbase comes with a full-featured, easy-to-use blog. Write articles, share updates, and connect with your audience on a deeper level—all from one place.
              </p>
               <Button asChild size="lg" className="mt-8 h-14 rounded-full text-base font-bold px-8">
                  <Link href="/login">Start Writing Now</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 sm:py-24 bg-card text-card-foreground">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter">
                Get started in minutes
              </h2>
              <p className="mt-4 text-lg sm:text-xl text-muted-foreground">
                Creating your own Linkbase page is simple and intuitive.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-background/50 p-8 text-center flex flex-col items-center rounded-3xl">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary text-primary-foreground mb-6">
                  <UserPlus className="h-8 w-8" />
                </div>
                <h3 className="font-headline text-2xl font-bold mb-2">1. Create Account</h3>
                <p className="text-muted-foreground">Sign up for free in seconds. All you need is an email to get started on your creative journey.</p>
              </Card>
              <Card className="bg-background/50 p-8 text-center flex flex-col items-center rounded-3xl">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-secondary text-secondary-foreground mb-6">
                  <Palette className="h-8 w-8" />
                </div>
                <h3 className="font-headline text-2xl font-bold mb-2">2. Design your Page</h3>
                <p className="text-muted-foreground">Add your links and customize the design. Use our editor or let our AI do the magic for you.</p>
              </Card>
              <Card className="bg-background/50 p-8 text-center flex flex-col items-center rounded-3xl">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-destructive text-destructive-foreground mb-6">
                  <Share2 className="h-8 w-8" />
                </div>
                <h3 className="font-headline text-2xl font-bold mb-2">3. Share your Link</h3>
                <p className="text-muted-foreground">Share it on your social media, email signature, or anywhere you want.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 sm:py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter">
                        By creators, for creators.
                    </h2>
                    <p className="mt-4 text-lg sm:text-xl text-muted-foreground">
                        Thousands already trust Linkbase to bundle and share their digital identity.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="bg-card p-6 rounded-2xl shadow-none border">
                        <CardContent className="p-0">
                            <p className="text-foreground mb-6">"Finally a platform that gives me the creative freedom I need. The customization options are insane!"</p>
                            <div className="flex items-center gap-3">
                                {testimonial1 && <Avatar>
                                    <AvatarImage src={testimonial1.imageUrl} alt="Anna L." />
                                    <AvatarFallback>AL</AvatarFallback>
                                </Avatar>}
                                <div>
                                    <p className="font-semibold">Anna L.</p>
                                    <p className="text-sm text-muted-foreground">Designer & Illustrator</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card p-6 rounded-2xl shadow-none border">
                        <CardContent className="p-0">
                            <p className="text-foreground mb-6">"Setup was a breeze. Within 10 minutes my page was online and looked fantastic."</p>
                            <div className="flex items-center gap-3">
                                {testimonial2 && <Avatar>
                                    <AvatarImage src={testimonial2.imageUrl} alt="Marco B." />
                                    <AvatarFallback>MB</AvatarFallback>
                                </Avatar>}
                                <div>
                                    <p className="font-semibold">Marco B.</p>
                                    <p className="text-sm text-muted-foreground">Musician & Producer</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card p-6 rounded-2xl shadow-none border">
                        <CardContent className="p-0">
                            <p className="text-foreground mb-6">"Linkbase exceeded my expectations. It's not just a 'link-in-bio', it's my digital business card."</p>
                            <div className="flex items-center gap-3">
                                {testimonial3 && <Avatar>
                                    <AvatarImage src={testimonial3.imageUrl} alt="Clara S." />
                                    <AvatarFallback>CS</AvatarFallback>
                                </Avatar>}
                                <div>
                                    <p className="font-semibold">Clara S.</p>
                                    <p className="text-sm text-muted-foreground">Food Blogger</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
        
        <section className="py-16 sm:py-24 bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
                <h2 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter">
                    Ready to transform your online presence?
                </h2>
                <p className="mt-4 text-lg sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
                    Join thousands of creators who trust Linkbase to share their content.
                </p>
                <div className="mt-8">
                    <Button size="lg" asChild className="h-14 rounded-full text-base font-bold px-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                        <Link href="/login">Start for free now</Link>
                    </Button>
                </div>
            </div>
        </section>
      </main>

      <footer className="bg-background">
        <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="font-headline font-bold text-xl text-foreground">
                Linkbase*
            </Link>
            <nav className="flex gap-4 sm:gap-6 text-sm font-medium">
                <Link href="/features" className="text-muted-foreground hover:text-foreground">Features</Link>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
            </nav>
            <p className="text-sm text-muted-foreground">© 2024 Linkbase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
