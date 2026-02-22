import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Impressum / Legal Notice',
  description: 'Impressum und rechtliche Angaben für Linkbase.',
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="font-bold text-xl text-primary">Linkbase*</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* German version */}
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Impressum</h1>
        <p className="text-muted-foreground mb-8">Angaben gemäß § 5 TMG</p>

        <section className="space-y-6 mb-12">
          <div>
            <h2 className="text-xl font-bold mb-1">Betreiber</h2>
            <p>Benedikt Schächner</p>
            <p>Musterstraße 1 {/* TODO: Bitte durch Ihre tatsächliche Adresse ersetzen */}</p>
            <p>80000 München</p>
            <p>Deutschland</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-1">Kontakt</h2>
            <p>E-Mail: <a href="mailto:contact@linkbase.app" className="text-primary underline">contact@linkbase.app</a></p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-1">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>Benedikt Schächner</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-1">Haftungsausschluss</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit
              und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß
              § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
              Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte
              fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
              hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen
              Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
              Kenntnis einer konkreten Rechtsverletzung möglich.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-1">Streitschlichtung</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                https://ec.europa.eu/consumers/odr
              </a>. Unsere E-Mail-Adresse finden Sie oben im Impressum.
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>
        </section>

        <hr className="my-8" />

        {/* English version */}
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Legal Notice</h1>
        <p className="text-muted-foreground mb-8">Information according to § 5 TMG (German Telemedia Act)</p>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-1">Operator</h2>
            <p>Benedikt Schächner</p>
            <p>Musterstraße 1 {/* TODO: Replace with your actual address */}</p>
            <p>80000 München</p>
            <p>Germany</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-1">Contact</h2>
            <p>Email: <a href="mailto:contact@linkbase.app" className="text-primary underline">contact@linkbase.app</a></p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-1">Responsible for content</h2>
            <p>Benedikt Schächner</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-1">Disclaimer</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The contents of this website have been compiled with the utmost care. However, we cannot guarantee
              the accuracy, completeness or topicality of the content. As a service provider, we are responsible
              for our own content on these pages in accordance with general laws. According to §§ 8 to 10 TMG,
              however, we are not obliged to monitor transmitted or stored third-party information or to investigate
              circumstances that indicate illegal activity.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/impressum" className="hover:text-foreground">Impressum</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          <Link href="/cookies" className="hover:text-foreground">Cookie Policy</Link>
          <Link href="/" className="hover:text-foreground">Home</Link>
        </div>
      </footer>
    </div>
  );
}
