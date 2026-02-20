import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MoveRight, Paintbrush, Sparkles, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <main className="relative flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-background via-secondary/50 to-background overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10" />
        <div className="text-center max-w-4xl z-10 mt-20 sm:mt-0">
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
      </main>

      <section className="py-20 sm:py-32 px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Deine Kreativität, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">grenzenlos</span>.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Gestalte ein Profil, das so einzigartig ist wie du. BioBloom gibt dir die Werkzeuge, um dich auszudrücken.
          </p>
        </div>
        <div className="mt-16 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-card/50 border border-border transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-6">
              <Paintbrush className="h-8 w-8" />
            </div>
            <h3 className="font-headline text-2xl font-bold text-foreground mb-3">Vollständig anpassbar</h3>
            <p className="text-muted-foreground">
              Wähle aus unzähligen Layouts, Farben und Schriftarten, um ein Profil zu erstellen, das wirklich dir gehört.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-card/50 border border-border transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="font-headline text-2xl font-bold text-foreground mb-3">KI-gestützte Themes</h3>
            <p className="text-muted-foreground">
              Beschreibe deine Ästhetik und lass unsere KI in Sekundenschnelle ein atemberaubendes Theme für dich generieren.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-card/50 border border-border transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-6">
              <Globe className="h-8 w-8" />
            </div>
            <h3 className="font-headline text-2xl font-bold text-foreground mb-3">Überall teilen</h3>
            <p className="text-muted-foreground">
              Dein einziger Link für all deine Social-Media-Bios. Verbinde dein Publikum mit allem, was du machst.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-32 px-6 lg:px-8 bg-secondary/30">
        <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                Bereit, deine Geschichte zu erzählen?
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
                Tritt der Community von Kreativen, Unternehmern und Machern bei, die BioBloom nutzen, um ihre Welt zu teilen.
            </p>
            <div className="mt-10 flex justify-center group">
                <Button asChild size="lg" className="text-lg py-8 px-10 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary/50">
                    <Link href="/profile">
                        Jetzt kostenlos starten
                        <MoveRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
            </div>
        </div>
      </section>

      <footer className="py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Powered by <span className="font-semibold text-primary">BioBloom</span>
        </p>
      </footer>
    </div>
  );
}
