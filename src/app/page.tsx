import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPage() {
  const creatorImage1 = PlaceHolderImages.find(p => p.id === 'landing-creator-1');
  const creatorImage2 = PlaceHolderImages.find(p => p.id === 'landing-creator-2');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
        <nav className="bg-card/80 backdrop-blur-md w-full rounded-full border shadow-md p-2 flex items-center justify-between">
          <Link href="/" className="font-headline font-bold text-xl pl-4">
            BioBloom*
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="rounded-full">
              <Link href="/profile">Anmelden</Link>
            </Button>
            <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/80">
              <Link href="/profile">Kostenlos registrieren</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1 flex items-center px-4 pt-28 pb-16">
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
              <Button size="lg" className="h-14 rounded-full text-base font-bold w-full sm:w-auto px-8 bg-primary text-primary-foreground">
                Kostenlos loslegen
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
      </main>
    </div>
  );
}
