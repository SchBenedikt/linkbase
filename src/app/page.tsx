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
                <Button variant="outline" asChild className="rounded-full hidden sm:flex border-[#254e1a] text-[#254e1a] hover:bg-[#254e1a] hover:text-[#d2e822]">
                    <Link href="/profile">Dashboard</Link>
                </Button>
                <UserNav />
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="rounded-full text-[#254e1a] hover:bg-black/10">
                <Link href="/login">Anmelden</Link>
            </Button>
            <Button asChild className="rounded-full bg-[#254e1a] text-[#d2e822] hover:bg-[#254e1a]/90">
                <Link href="/login">Kostenlos registrieren</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="text-foreground flex flex-col min-h-screen">
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl">
        <nav className="bg-white/30 backdrop-blur-md w-full rounded-full border border-black/10 p-2 flex items-center justify-between">
          <Link href="/" className="font-headline font-bold text-xl pl-4 text-[#254e1a]">
            BioBloom*
          </Link>
          {renderAuthButtons()}
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#d2e822] text-[#254e1a] pt-32 pb-16 px-4">
            <div className="container mx-auto grid md:grid-cols-3 gap-8 items-center">
                 <div className="md:col-span-2 flex flex-col gap-6 items-start text-left">
                     <h1 className="font-headline text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tighter leading-tight">
                        Ein Link im Profil, für dich gemacht.
                    </h1>
                    <p className="max-w-xl text-lg sm:text-xl text-[#254e1a]/80">
                        Alles, was du bist, an einem einzigen Ort. Teile deine Kreationen,
                        deine Arbeit und deine Persönlichkeit mit der Welt.
                    </p>
                    <form className="w-full max-w-md flex flex-col sm:flex-row gap-2 mt-4">
                        <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#254e1a]/60">biobloom.co/</span>
                        <Input
                            type="text"
                            placeholder="dein-name"
                            className="w-full h-14 rounded-full pl-32 pr-4 text-base bg-black/5 border-[#254e1a]/20 placeholder:text-[#254e1a]/50 text-[#254e1a] focus:ring-[#254e1a]"
                        />
                        </div>
                        <Button asChild size="lg" className="h-14 rounded-full text-base font-bold w-full sm:w-auto px-8 bg-[#254e1a] text-[#d2e822] hover:bg-[#254e1a]/90">
                            <Link href="/login">Kostenlos loslegen</Link>
                        </Button>
                    </form>
                 </div>
                 <div className="hidden md:block relative h-96">
                    {heroImage1 && (
                        <div className="absolute top-0 right-0 w-64 h-72 rounded-3xl overflow-hidden transform rotate-6 translate-x-8">
                             <Image src={heroImage1.imageUrl} alt={heroImage1.description} data-ai-hint={heroImage1.imageHint} fill sizes="256px" className="object-cover"/>
                        </div>
                    )}
                    {heroImage2 && (
                        <div className="absolute bottom-0 left-0 w-48 h-56 rounded-3xl overflow-hidden transform -rotate-8 -translate-y-4">
                            <Image src={heroImage2.imageUrl} alt={heroImage2.description} data-ai-hint={heroImage2.imageHint} fill sizes="192px" className="object-cover"/>
                        </div>
                    )}
                 </div>
            </div>
        </section>

        {/* Marquee Section */}
        <section className="py-8 bg-[#f3f3f1]">
             <div className="text-center mb-4">
                <h2 className="font-headline text-lg font-bold tracking-tight text-muted-foreground">
                    VERTRAUT VON ÜBER 70M+ CREATORN
                </h2>
            </div>
            <Marquee />
        </section>


        {/* New Bento Grid Section */}
        <section className="py-16 sm:py-24 bg-[#e9c0e9] text-[#780c16]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter">
                Eine Leinwand für deine digitale Welt
              </h2>
              <p className="mt-4 text-lg sm:text-xl text-[#780c16]/80">
                BioBloom bietet dir alle Werkzeuge, um eine Seite zu gestalten, die so einzigartig ist wie du. Flexibel, leistungsstark und wunderschön.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 p-8 flex flex-col justify-between bg-[#254e1a] text-[#d2e822] rounded-3xl border-none shadow-none">
                <div>
                  <div className="p-2 bg-white/10 rounded-full w-fit mb-4">
                    <Palette className="h-6 w-6" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold mb-2">Design ohne Grenzen</h3>
                  <p className="text-[#d2e822]/80 mb-4">Passe Farben, Schriftarten, Hintergründe, Ränder und mehr an. Oder lass unsere KI einzigartige Themes für dich erstellen.</p>
                </div>
                <Link href="/login" className="font-semibold inline-flex items-center gap-2 group">
                  Jetzt gestalten <MoveRight className="h-4 w-4" />
                </Link>
              </Card>
              <Card className="p-8 flex flex-col justify-between bg-[#d2e822] text-[#254e1a] rounded-3xl border-none shadow-none">
                <div>
                  <div className="p-2 bg-black/10 rounded-full w-fit mb-4">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold mb-2">KI-gestützte Magie</h3>
                  <p className="text-[#254e1a]/80">Beschreibe deinen Stil und unsere KI generiert atemberaubende Farbpaletten und Theme-Vorschläge.</p>
                </div>
              </Card>
              <Card className="p-8 flex flex-col justify-between bg-[#ff9312] text-[#4c2f05] rounded-3xl border-none shadow-none">
                 <div>
                   <div className="p-2 bg-black/10 rounded-full w-fit mb-4">
                      <LinkIcon className="h-6 w-6" />
                   </div>
                  <h3 className="font-headline text-2xl font-bold mb-2">Alle deine Links</h3>
                  <p className="text-[#4c2f05]/80">Von Social Media über Projekte bis hin zu Shops – präsentiere alles, was dich ausmacht, an einem zentralen Ort.</p>
                </div>
              </Card>
              <Card className="md:col-span-2 p-8 flex flex-col justify-between bg-[#780c16] text-[#e9c0e9] rounded-3xl border-none shadow-none">
                <div>
                  <div className="p-2 bg-white/10 rounded-full w-fit mb-4">
                     <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold mb-2">Detaillierte Analysen</h3>
                  <p className="text-[#e9c0e9]/80">Verstehe dein Publikum. Finde heraus, welche deiner Inhalte am besten ankommen, und optimiere deine Präsenz.</p>
                </div>
                <Link href="/login" className="font-semibold inline-flex items-center gap-2 group">
                  Einblicke erhalten <MoveRight className="h-4 w-4" />
                </Link>
              </Card>
            </div>
          </div>
        </section>


        {/* Testimonials Section */}
        <section className="py-16 sm:py-24 bg-[#f3f3f1]">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter">
                        Von Creatorn für Creator.
                    </h2>
                    <p className="mt-4 text-lg sm:text-xl text-muted-foreground">
                        Tausende vertrauen bereits auf BioBloom, um ihre digitale Identität zu bündeln und zu teilen.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="bg-card p-6 rounded-2xl shadow-none border">
                        <CardContent className="p-0">
                            <p className="text-foreground mb-6">"Endlich eine Plattform, die mir die kreative Freiheit gibt, die ich brauche. Die Anpassungsmöglichkeiten sind der Wahnsinn!"</p>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src="https://picsum.photos/seed/test1/40/40" alt="Anna L." />
                                    <AvatarFallback>AL</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">Anna L.</p>
                                    <p className="text-sm text-muted-foreground">Designerin & Illustratorin</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card p-6 rounded-2xl shadow-none border">
                        <CardContent className="p-0">
                            <p className="text-foreground mb-6">"Die Einrichtung war ein Kinderspiel. Innerhalb von 10 Minuten war meine Seite online und sah fantastisch aus."</p>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src="https://picsum.photos/seed/test2/40/40" alt="Marco B." />
                                    <AvatarFallback>MB</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">Marco B.</p>
                                    <p className="text-sm text-muted-foreground">Musiker & Produzent</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card p-6 rounded-2xl shadow-none border">
                        <CardContent className="p-0">
                            <p className="text-foreground mb-6">"BioBloom hat meine Erwartungen übertroffen. Es ist nicht nur ein 'Link-in-Bio', es ist meine digitale Visitenkarte."</p>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src="https://picsum.photos/seed/test3/40/40" alt="Clara S." />
                                    <AvatarFallback>CS</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">Clara S.</p>
                                    <p className="text-sm text-muted-foreground">Food-Bloggerin</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
        
        <section className="py-16 sm:py-24 bg-[#254e1a] text-[#d2e822]">
            <div className="container mx-auto px-4 text-center">
                <h2 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter">
                    Bereit, deine Online-Präsenz zu verwandeln?
                </h2>
                <p className="mt-4 text-lg sm:text-xl text-[#d2e822]/80 max-w-2xl mx-auto">
                    Schließe dich Tausenden von Creatorn an, die BioBloom vertrauen, um ihre Inhalte zu teilen.
                </p>
                <div className="mt-8">
                    <Button size="lg" asChild className="h-14 rounded-full text-base font-bold px-8 bg-[#d2e822] text-[#254e1a] hover:bg-[#d2e822]/90">
                        <Link href="/login">Jetzt kostenlos starten</Link>
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
                <Link href="#" className="text-muted-foreground hover:text-foreground">Features</Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">Preise</Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">Kontakt</Link>
            </nav>
            <p className="text-sm text-muted-foreground">© 2024 BioBloom. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}
