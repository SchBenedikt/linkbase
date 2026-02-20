import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-background text-foreground">
      <div className="text-center max-w-4xl">
        <h1 className="font-headline text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tighter">
          Alles, was du bist, an einem Ort.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          BioBloom ist deine Bühne. Erstelle ein persönliches Profil, das all deine Leidenschaften, Projekte und Links an einem einzigen, ausdrucksstarken Ort bündelt.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button asChild size="lg" className="text-lg py-7 px-8">
            <Link href="/profile">
              Mein Profil ansehen
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
      <footer className="absolute bottom-8 text-center">
        <p className="text-sm text-muted-foreground">
          Powered by <span className="font-semibold text-primary">BioBloom</span>
        </p>
      </footer>
    </main>
  );
}
