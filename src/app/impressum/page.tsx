import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Legal Notice',
  description: 'Legal notice and operator information for Linkbase.',
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
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Legal Notice</h1>
        <p className="text-muted-foreground mb-8">Information according to § 5 TMG (German Telemedia Act)</p>

        <section className="space-y-6 text-sm leading-relaxed">
          <div>
            <h2 className="text-xl font-bold mb-1">Operator</h2>
            <p>Benedikt Schächner</p>
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
            <p className="text-muted-foreground">
              The contents of this website have been compiled with the utmost care. However, we cannot guarantee
              the accuracy, completeness or topicality of the content. As a service provider, we are responsible
              for our own content on these pages in accordance with general laws. According to §§ 8 to 10 TMG,
              however, we are not obliged to monitor transmitted or stored third-party information or to investigate
              circumstances that indicate illegal activity.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-1">Dispute resolution</h2>
            <p className="text-muted-foreground">
              The European Commission provides a platform for online dispute resolution (ODR):{' '}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                https://ec.europa.eu/consumers/odr
              </a>. We are not willing or obliged to participate in dispute resolution proceedings before a
              consumer arbitration board.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/impressum" className="hover:text-foreground">Legal Notice</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          <Link href="/cookies" className="hover:text-foreground">Cookie Policy</Link>
          <Link href="/" className="hover:text-foreground">Home</Link>
        </div>
      </footer>
    </div>
  );
}
