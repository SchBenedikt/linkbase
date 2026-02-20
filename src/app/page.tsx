import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MoveRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-background to-secondary text-foreground overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10" />
      <div className="text-center max-w-4xl z-10">
        <h1 className="font-headline text-6xl sm:text-8xl md:text-9xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-200% animate-gradient">
          Alles, was du bist, an einem Ort.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          BioBloom ist deine Bühne. Erstelle ein persönliches Profil, das all deine Leidenschaften, Projekte und Links an einem einzigen, ausdrucksstarken Ort bündelt.
        </p>
        <div className="mt-10 flex justify-center group">
          <Button asChild size="lg" className="text-lg py-8 px-10 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary/50">
            <Link href="/profile">
              Erstelle dein Profil
              <MoveRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
      <footer className="absolute bottom-8 text-center z-10">
        <p className="text-sm text-muted-foreground">
          Powered by <span className="font-semibold text-primary">BioBloom</span>
        </p>
      </footer>
    </main>
  );
}
