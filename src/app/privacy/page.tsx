import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy and data protection information for Linkbase.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="font-bold text-xl text-primary">Linkbase*</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 2025</p>

        <section className="space-y-6 text-sm leading-relaxed">
          <div>
            <h2 className="text-xl font-bold mb-2">1. Who we are</h2>
            <p>
              Linkbase (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is operated by Benedikt Schächner, Germany.
              Contact: <a href="mailto:contact@linkbase.app" className="text-primary underline">contact@linkbase.app</a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">2. Data we collect</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Account data</strong>: email address and display name when you register via Google or email/password.</li>
              <li><strong>Profile data</strong>: name, bio, avatar URL, links, and appearance settings you add to your page.</li>
              <li><strong>Usage data</strong>: standard server logs (IP address, browser type, pages visited) for security and debugging.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">3. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>To provide and improve the Linkbase service.</li>
              <li>To display your public profile page to visitors.</li>
              <li>To authenticate you and keep your account secure.</li>
              <li>We do <strong>not</strong> sell your personal data to third parties.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">4. Third-party services</h2>
            <p className="text-muted-foreground">
              We use the following third-party services which may process your data:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
              <li><strong>Google Firebase</strong> (Authentication &amp; Firestore database) – <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">Privacy Policy</a></li>
              <li><strong>Cloudflare Pages</strong> (hosting) – <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Privacy Policy</a></li>
              <li><strong>Google AI (Gemini)</strong> – used only when you explicitly generate an AI theme – <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">5. Cookies</h2>
            <p className="text-muted-foreground">
              We use only technically necessary cookies (e.g., for authentication session management).
              We do not use tracking or advertising cookies. See our <Link href="/cookies" className="text-primary underline">Cookie Policy</Link> for details.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">6. Your rights (GDPR)</h2>
            <p className="text-muted-foreground">
              Under the GDPR you have the right to access, rectify, erase, restrict, or port your personal data,
              and to object to its processing. To exercise these rights, contact us at{' '}
              <a href="mailto:contact@linkbase.app" className="text-primary underline">contact@linkbase.app</a>.
              You also have the right to lodge a complaint with your national data protection authority.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">7. Data retention</h2>
            <p className="text-muted-foreground">
              We retain your data for as long as your account is active. You may delete your account at any time
              from the account settings page.
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
