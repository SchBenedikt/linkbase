import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Cookie Policy for Linkbase.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="font-bold text-xl text-primary">Linkbase*</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 2025</p>

        <section className="space-y-6 text-sm leading-relaxed">
          <div>
            <h2 className="text-xl font-bold mb-2">What are cookies?</h2>
            <p className="text-muted-foreground">
              Cookies are small text files stored on your device by your browser when you visit a website.
              They are widely used to make websites work, or work more efficiently, as well as to provide
              information to the owners of the site.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">Cookies we use</h2>
            <p className="text-muted-foreground mb-3">
              Linkbase uses only <strong>strictly necessary cookies</strong>. We do not use any tracking,
              analytics, advertising, or third-party marketing cookies.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted text-muted-foreground">
                    <th className="border border-border px-3 py-2 text-left">Cookie</th>
                    <th className="border border-border px-3 py-2 text-left">Purpose</th>
                    <th className="border border-border px-3 py-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border px-3 py-2 font-mono">firebase-auth-token</td>
                    <td className="border border-border px-3 py-2 text-muted-foreground">Authentication session (Google Firebase)</td>
                    <td className="border border-border px-3 py-2 text-muted-foreground">Session / 1 year</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-3 py-2 font-mono">theme</td>
                    <td className="border border-border px-3 py-2 text-muted-foreground">Remembers your light/dark mode preference</td>
                    <td className="border border-border px-3 py-2 text-muted-foreground">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">Managing cookies</h2>
            <p className="text-muted-foreground">
              You can control and/or delete cookies as you wish. You can delete all cookies that are already
              on your computer and you can set most browsers to prevent them from being placed. If you do this,
              however, you may have to manually adjust some preferences every time you visit a site and some
              services and functionalities may not work.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">Contact</h2>
            <p className="text-muted-foreground">
              Questions about our cookie policy? Contact us at{' '}
              <a href="mailto:contact@linkbase.app" className="text-primary underline">contact@linkbase.app</a>.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-8 flex flex-wrap gap-4 sm:gap-6 text-sm text-muted-foreground">
          <Link href="/features" className="hover:text-foreground">Features</Link>
          <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
          <Link href="/impressum" className="hover:text-foreground">Legal Notice</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/cookies" className="hover:text-foreground">Cookies</Link>
        </div>
      </footer>
    </div>
  );
}
