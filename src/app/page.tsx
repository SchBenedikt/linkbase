'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Palette, Link as LinkIcon, LayoutTemplate, MousePointerClick } from 'lucide-react';
import { useUser } from '@/firebase';
import { UserNav } from '@/components/user-nav';
import { Skeleton } from '@/components/ui/skeleton';

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

        <section className="py-16 sm:py-24 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter">
                Entfessle deine Kreativität
              </h2>
              <p className="mt-4 text-lg sm:text-xl text-muted-foreground">
                BioBloom gibt dir die Werkzeuge, um eine wunderschöne und leistungsstarke "Link-in-Bio"-Seite zu erstellen, die wirklich dir gehört.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-card p-6 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
                <Palette className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-headline text-xl font-bold mb-2">Anpassbare Themen</h3>
                <p className="text-muted-foreground">Gestalte ein Profil, das wirklich zu dir passt. Wähle aus unzähligen Farben, Schriftarten und Layouts.</p>
              </div>
              <div className="bg-card p-6 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
                <LinkIcon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-headline text-xl font-bold mb-2">Unbegrenzte Links</h3>
                <p className="text-muted-foreground">Teile all deine Inhalte an einem Ort. Von deinem neuesten Video bis zu deinem Online-Shop.</p>
              </div>
              <div className="bg-card p-6 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
                <LayoutTemplate className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-headline text-xl font-bold mb-2">Wunderschöne Vorlagen</h3>
                <p className="text-muted-foreground">Starte schnell mit professionell gestalteten Vorlagen, die für jeden Stil geeignet sind.</p>
              </div>
              <div className="bg-card p-6 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
                <MousePointerClick className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-headline text-xl font-bold mb-2">Detaillierte Analysen</h3>
                <p className="text-muted-foreground">Verstehe dein Publikum besser mit Einblicken in deine Klicks und Besucher.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter">
                In 3 einfachen Schritten zu deinem BioBloom
              </h2>
              <p className="mt-4 text-lg sm:text-xl text-muted-foreground">
                Deine neue Online-Heimat ist nur wenige Klicks entfernt.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-headline text-3xl font-bold mb-6">1</div>
                <h3 className="font-headline text-2xl font-bold mb-2">Profil erstellen</h3>
                <p className="text-muted-foreground max-w-xs">Registriere dich kostenlos und wähle deinen einzigartigen biobloom.co-Link.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-headline text-3xl font-bold mb-6">2</div>
                <h3 className="font-headline text-2xl font-bold mb-2">Links hinzufügen</h3>
                <p className="text-muted-foreground max-w-xs">Füge Links zu deinen sozialen Netzwerken, Projekten, Shops und mehr hinzu.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-headline text-3xl font-bold mb-6">3</div>
                <h3 className="font-headline text-2xl font-bold mb-2">Design anpassen</h3>
                <p className="text-muted-foreground max-w-xs">Personalisiere das Aussehen deines Profils, um deine Marke widerzuspiegeln.</p>
              </div>
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
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Über uns</Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Preise</Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Kontakt</Link>
            </nav>
            <p className="text-sm text-muted-foreground">© 2024 BioBloom. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}
