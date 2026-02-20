'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Palette, Link as LinkIcon, Sparkles, BarChart3, MoveRight } from 'lucide-react';
import { useUser } from '@/firebase';
import { UserNav } from '@/components/user-nav';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function LandingPage() {
  const creatorImage1 = PlaceHolderImages.find(p => p.id === 'landing-creator-1');
  const creatorImage2 = PlaceHolderImages.find(p => p.id === 'landing-creator-2');
  const { user, isUserLoading } = useUser();

  const renderAuthButtons = () => {
    if (isUserLoading) {
        return <Skeleton className="h-10 w-24 rounded-full" />;
    }
    if (user) {
        return (
            <div className="flex items-center gap-2">
                <Button variant="outline" asChild className="rounded-full hidden sm:flex">
                    <Link href="/profile">Dashboard</Link>
                </Button>
                <UserNav />
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="rounded-full">
                <Link href="/login">Anmelden</Link>
            </Button>
            <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/80">
                <Link href="/login">Kostenlos registrieren</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
        <nav className="bg-card/80 backdrop-blur-md w-full rounded-full border shadow-md p-2 flex items-center justify-between">
          <Link href="/" className="font-headline font-bold text-xl pl-4">
            BioBloom*
          </Link>
          {renderAuthButtons()}
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="flex items-center px-4 pt-28 pb-16">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6 text-center md:text-left items-center md:items-start">
              <h1 className="font-headline text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tighter leading-tight">
                Ein Link im Profil, für dich gemacht.
              </h1>
              <p className="max-w-lg text-lg sm:text-xl text-foreground/80">
                Alles, was du bist, an einem einzigen Ort. Teile deine Kreationen,
                deine Arbeit und deine Persönlichkeit mit der Welt.
              </p>
              <form className="w-full max-w-md flex flex-col sm:flex-row gap-2 mt-4">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">biobloom.co/</span>
                  <Input
                    type="text"
                    placeholder="dein-name"
                    className="w-full h-14 rounded-full pl-32 pr-4 text-base"
                  />
                </div>
                <Button asChild size="lg" className="h-14 rounded-full text-base font-bold w-full sm:w-auto px-8 bg-primary text-primary-foreground">
                    <Link href="/login">Kostenlos loslegen</Link>
                </Button>
              </form>
            </div>

            <div className="relative h-[60vh] max-h-[700px] hidden md:block">
              {creatorImage1 && (
                <div className="absolute top-0 right-0 w-3/4 aspect-[4/3] transform rotate-6 translate-x-4 hover:rotate-2 hover:scale-105 transition-transform duration-300">
                  <figure className="relative w-full h-full">
                    <Image
                      src={creatorImage1.imageUrl}
                      alt="Koy Sun. Lettering artist and illustrator."
                      data-ai-hint={creatorImage1.imageHint}
                      fill
                      sizes="(max-width: 768px) 0vw, 40vw"
                      className="object-cover rounded-3xl shadow-2xl"
                    />
                    <figcaption className="absolute bottom-4 left-4 text-white font-bold text-sm bg-black/30 px-3 py-1 rounded-full">
                      Koy Sun. Lettering artist und Illustrator.
                    </figcaption>
                  </figure>
                </div>
              )}
              {creatorImage2 && (
                <div className="absolute bottom-0 left-0 w-2/3 aspect-[3/4] transform -rotate-3 -translate-x-4 hover:rotate-0 hover:scale-105 transition-transform duration-300">
                   <figure className="relative w-full h-full">
                    <Image
                      src={creatorImage2.imageUrl}
                      alt="Nico and Fran. Founders of Pistakio."
                      data-ai-hint={creatorImage2.imageHint}
                      fill
                      sizes="(max-width: 768px) 0vw, 35vw"
                      className="object-cover rounded-3xl shadow-2xl"
                    />
                     <figcaption className="absolute bottom-4 left-4 text-white font-bold text-sm bg-black/30 px-3 py-1 rounded-full">
                      Nico und Fran. Gründer von Pistakio.
                    </figcaption>
                  </figure>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* New Bento Grid Section */}
        <section className="py-16 sm:py-24 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter">
                Eine Leinwand für deine digitale Welt
              </h2>
              <p className="mt-4 text-lg sm:text-xl text-muted-foreground">
                BioBloom bietet dir alle Werkzeuge, um eine Seite zu gestalten, die so einzigartig ist wie du. Flexibel, leistungsstark und wunderschön.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 p-8 flex flex-col justify-between bg-card shadow-lg hover:shadow-xl transition-shadow">
                <div>
                  <div className="p-2 bg-primary/10 rounded-full w-fit mb-4">
                    <Palette className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold mb-2">Design ohne Grenzen</h3>
                  <p className="text-muted-foreground mb-4">Passe Farben, Schriftarten, Hintergründe, Ränder und mehr an. Oder lass unsere KI einzigartige Themes für dich erstellen.</p>
                </div>
                <Link href="/login" className="font-semibold text-primary inline-flex items-center gap-2 group">
                  Jetzt gestalten <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Card>
              <Card className="p-8 flex flex-col justify-between bg-card shadow-lg hover:shadow-xl transition-shadow">
                <div>
                  <div className="p-2 bg-accent/10 rounded-full w-fit mb-4">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold mb-2">KI-gestützte Magie</h3>
                  <p className="text-muted-foreground">Beschreibe deinen Stil und unsere KI generiert atemberaubende Farbpaletten und Theme-Vorschläge.</p>
                </div>
              </Card>
              <Card className="p-8 flex flex-col justify-between bg-card shadow-lg hover:shadow-xl transition-shadow">
                 <div>
                   <div className="p-2 bg-chart-1/10 rounded-full w-fit mb-4">
                      <LinkIcon className="h-6 w-6 text-chart-1" />
                   </div>
                  <h3 className="font-headline text-2xl font-bold mb-2">Alle deine Links</h3>
                  <p className="text-muted-foreground">Von Social Media über Projekte bis hin zu Shops – präsentiere alles, was dich ausmacht, an einem zentralen Ort.</p>
                </div>
              </Card>
              <Card className="md:col-span-2 p-8 flex flex-col justify-between bg-card shadow-lg hover:shadow-xl transition-shadow">
                <div>
                  <div className="p-2 bg-chart-2/10 rounded-full w-fit mb-4">
                     <BarChart3 className="h-6 w-6 text-chart-2" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold mb-2">Detaillierte Analysen</h3>
                  <p className="text-muted-foreground">Verstehe dein Publikum. Finde heraus, welche deiner Inhalte am besten ankommen, und optimiere deine Präsenz.</p>
                </div>
                <Link href="/login" className="font-semibold text-primary inline-flex items-center gap-2 group">
                  Einblicke erhalten <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Card>
            </div>
          </div>
        </section>


        {/* Testimonials Section */}
        <section className="py-16 sm:py-24">
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
                    <Card className="bg-card p-6 rounded-2xl shadow-sm">
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
                    <Card className="bg-card p-6 rounded-2xl shadow-sm">
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
                    <Card className="bg-card p-6 rounded-2xl shadow-sm">
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
        
        <section className="py-16 sm:py-24 bg-grid-pattern">
            <div className="container mx-auto px-4 text-center">
                <h2 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter">
                    Bereit, deine Online-Präsenz zu verwandeln?
                </h2>
                <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                    Schließe dich Tausenden von Creatorn an, die BioBloom vertrauen, um ihre Inhalte zu teilen.
                </p>
                <div className="mt-8">
                    <Button size="lg" asChild className="h-14 rounded-full text-base font-bold px-8 bg-primary text-primary-foreground">
                        <Link href="/login">Jetzt kostenlos starten</Link>
                    </Button>
                </div>
            </div>
        </section>
      </main>

      <footer className="bg-card/50">
        <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="font-headline font-bold text-xl">
                BioBloom*
            </Link>
            <nav className="flex gap-4 sm:gap-6 text-sm font-medium">
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Preise</Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Kontakt</Link>
            </nav>
            <p className="text-sm text-muted-foreground">© 2024 BioBloom. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}
