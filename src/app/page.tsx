'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { Palette, Link as LinkIcon, Sparkles, BarChart3, MoveRight } from 'lucide-react';
import { useUser } from '@/firebase';
import { UserNav } from '@/components/user-nav';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const MarqueeItem = ({ image, shape = 'rounded-xl' }: { image: ImagePlaceholder, shape?: 'rounded-xl' | 'rounded-full' | 'rounded-lg' }) => (
    <div className={cn("relative h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 flex-shrink-0", shape)}>
         <Image
            src={image.imageUrl}
            alt={image.description}
            data-ai-hint={image.imageHint}
            fill
            sizes="(max-width: 768px) 128px, 160px"
            className={cn("object-cover", shape)}
        />
    </div>
);

const Marquee = () => {
    const marqueeImages = PlaceHolderImages.filter(p => p.id.startsWith('marquee-'));

    const renderItems = (items: ImagePlaceholder[]) => items.map((img, i) => (
        <MarqueeItem key={img.id} image={img} shape={i % 3 === 0 ? 'rounded-full' : (i % 3 === 1 ? 'rounded-3xl' : 'rounded-lg')} />
    ));

    return (
         <div className="relative flex w-full overflow-x-hidden">
            <div className="flex w-max animate-marquee items-center gap-6 py-4">
                {renderItems(marqueeImages)}
                {renderItems(marqueeImages)}
            </div>
        </div>
    );
};


export default function LandingPage() {
  const { user, isUserLoading } = useUser();
  const heroImage1 = PlaceHolderImages.find(p => p.id === 'hero-1');
  const heroImage2 = PlaceHolderImages.find(p => p.id === 'hero-2');

  const renderAuthButtons = () => {
    if (isUserLoading) {
        return <Skeleton className="h-10 w-24 rounded-full" />;
    }
    if (user) {
        return (
            <div className="flex items-center gap-2">
                <Button variant="outline" asChild className="rounded-full hidden sm:flex border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <Link href="/profile">Dashboard</Link>
                </Button>
                <UserNav />
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="rounded-full text-primary hover:bg-black/10">
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/login">Sign up Free</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="text-foreground flex flex-col min-h-screen">
      <header className="fixed top-4 z-50 w-full px-4">
        <div className="container mx-auto">
          <nav className="bg-white/30 backdrop-blur-md w-full rounded-full border border-black/10 p-2 flex items-center justify-between">
            <Link href="/" className="font-headline font-bold text-xl pl-4 text-primary">
              BioBloom*
            </Link>
            {renderAuthButtons()}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-accent text-primary min-h-screen flex items-center pt-24 pb-16 px-4">
            <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
                 <div className="flex flex-col gap-6 items-start text-left">
                     <h1 className="font-headline text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tighter leading-tight">
                        One link in bio, made for you.
                    </h1>
                    <p className="max-w-xl text-lg sm:text-xl text-primary/80">
                        Everything you are, all in one place. Share your creations, your work, and your personality with the world.
                    </p>
                    <form className="w-full max-w-md flex flex-col sm:flex-row gap-2 mt-4">
                        <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60">biobloom.co/</span>
                        <Input
                            type="text"
                            placeholder="your-name"
                            className="w-full h-14 rounded-full pl-32 pr-4 text-base bg-black/5 border-primary/20 placeholder:text-primary/50 text-primary focus:ring-primary"
                        />
                        </div>
                        <Button asChild size="lg" className="h-14 rounded-full text-base font-bold w-full sm:w-auto px-8">
                            <Link href="/login">Get Started for Free</Link>
                        </Button>
                    </form>
                 </div>
                 <div className="hidden md:block relative h-96">
                    {heroImage1 && (
                        <div className="absolute top-0 right-0 w-64 h-72 rounded-3xl overflow-hidden transform rotate-6 translate-x-8 transition-transform duration-300 ease-in-out hover:scale-105 hover:rotate-3">
                             <Image src={heroImage1.imageUrl} alt={heroImage1.description} data-ai-hint={heroImage1.imageHint} fill sizes="256px" className="object-cover"/>
                        </div>
                    )}
                    {heroImage2 && (
                        <div className="absolute bottom-0 left-0 w-48 h-56 rounded-3xl overflow-hidden transform -rotate-8 -translate-y-4 transition-transform duration-300 ease-in-out hover:scale-105 hover:-rotate-3">
                            <Image src={heroImage2.imageUrl} alt={heroImage2.description} data-ai-hint={heroImage2.imageHint} fill sizes="192px" className="object-cover"/>
                        </div>
                    )}
                 </div>
            </div>
        </section>

        {/* Marquee Section */}
        <section className="py-8 bg-background">
             <div className="text-center mb-4">
                <h2 className="font-headline text-lg font-bold tracking-tight text-muted-foreground">
                    TRUSTED BY 70M+ CREATORS
                </h2>
            </div>
            <Marquee />
        </section>


        {/* New Bento Grid Section */}
        <section className="py-16 sm:py-24 bg-background text-destructive">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter">
                A canvas for your digital world
              </h2>
              <p className="mt-4 text-lg sm:text-xl text-muted-foreground">
                BioBloom gives you all the tools to design a page that is as unique as you are. Flexible, powerful, and beautiful.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 p-8 flex flex-col justify-between bg-primary text-primary-foreground rounded-3xl border-none">
                <div>
                  <div className="p-2 bg-white/10 rounded-full w-fit mb-4">
                    <Palette className="h-6 w-6" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold mb-2">Design without limits</h3>
                  <p className="text-primary-foreground/80 mb-4">Customize colors, fonts, backgrounds, borders, and more. Or let our AI create unique themes for you.</p>
                </div>
                <Link href="/login" className="font-semibold inline-flex items-center gap-2 group">
                  Start designing <MoveRight className="h-4 w-4" />
                </Link>
              </Card>
              <Card className="p-8 flex flex-col justify-between bg-accent text-accent-foreground rounded-3xl border-none">
                <div>
                  <div className="p-2 bg-black/10 rounded-full w-fit mb-4">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold mb-2">AI-powered Magic</h3>
                  <p className="text-accent-foreground/80">Describe your style and our AI will generate stunning color palettes and theme suggestions.</p>
                </div>
              </Card>
              <Card className="p-8 flex flex-col justify-between bg-secondary text-secondary-foreground rounded-3xl border-none">
                 <div>
                   <div className="p-2 bg-black/10 rounded-full w-fit mb-4">
                      <LinkIcon className="h-6 w-6" />
                   </div>
                  <h3 className="font-headline text-2xl font-bold mb-2">All your links</h3>
                  <p className="text-secondary-foreground/80">From social media to projects to shops - present everything that makes you you in one central place.</p>
                </div>
              </Card>
              <Card className="md:col-span-2 p-8 flex flex-col justify-between bg-destructive text-destructive-foreground rounded-3xl border-none">
                <div>
                  <div className="p-2 bg-white/10 rounded-full w-fit mb-4">
                     <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold mb-2">Detailed Analytics</h3>
                  <p className="text-destructive-foreground/80">Understand your audience. Find out which of your content resonates best and optimize your presence.</p>
                </div>
                <Link href="/login" className="font-semibold inline-flex items-center gap-2 group">
                  Get insights <MoveRight className="h-4 w-4" />
                </Link>
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
                        Thousands already trust BioBloom to bundle and share their digital identity.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="bg-card p-6 rounded-2xl shadow-none border">
                        <CardContent className="p-0">
                            <p className="text-foreground mb-6">"Finally a platform that gives me the creative freedom I need. The customization options are insane!"</p>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src="https://picsum.photos/seed/test1/40/40" alt="Anna L." />
                                    <AvatarFallback>AL</AvatarFallback>
                                </Avatar>
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
                                <Avatar>
                                    <AvatarImage src="https://picsum.photos/seed/test2/40/40" alt="Marco B." />
                                    <AvatarFallback>MB</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">Marco B.</p>
                                    <p className="text-sm text-muted-foreground">Musician & Producer</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card p-6 rounded-2xl shadow-none border">
                        <CardContent className="p-0">
                            <p className="text-foreground mb-6">"BioBloom exceeded my expectations. It's not just a 'link-in-bio', it's my digital business card."</p>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src="https://picsum.photos/seed/test3/40/40" alt="Clara S." />
                                    <AvatarFallback>CS</AvatarFallback>
                                </Avatar>
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
                    Join thousands of creators who trust BioBloom to share their content.
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
                BioBloom*
            </Link>
            <nav className="flex gap-4 sm:gap-6 text-sm font-medium">
                <Link href="/features" className="text-muted-foreground hover:text-foreground">Features</Link>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
            </nav>
            <p className="text-sm text-muted-foreground">© 2024 BioBloom. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
