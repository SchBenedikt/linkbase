// THIS ROUTE IS DEPRECATED. Please use /s?code=...
// This file is kept to prevent build errors during the transition and can be deleted in the future.
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function DeprecatedRedirectPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,hsl(var(--secondary)/0.18),transparent_60%)] text-foreground">
        <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-5 px-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold">URL-Format veraltet</h1>
          <p className="text-muted-foreground">
            Kurzlinks verwenden jetzt das Format /s?code=... anstatt /s/...<br/>
            Bitte aktualisieren Sie Ihre gespeicherten Links.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Zur Startseite</Link>
          </Button>
        </div>
      </div>
  );
}
