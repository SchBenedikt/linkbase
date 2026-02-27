'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

const STORAGE_KEY = 'cookie-consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (e.g. SSR or private mode) — show banner
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, 'accepted'); } catch { /* ignore */ }
    setVisible(false);
  };

  const decline = () => {
    try { localStorage.setItem(STORAGE_KEY, 'declined'); } catch { /* ignore */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 z-[200] mx-auto max-w-xl rounded-2xl border bg-background/95 backdrop-blur-md p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-4"
    >
      <Cookie className="h-5 w-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
      <p className="text-sm text-muted-foreground flex-1">
        We use cookies to improve your experience.{' '}
        <Link href="/cookies" className="text-primary underline-offset-2 hover:underline">
          Cookie Policy
        </Link>
      </p>
      <div className="flex gap-2 shrink-0">
        <Button size="sm" variant="outline" onClick={decline} className="rounded-full">
          Decline
        </Button>
        <Button size="sm" onClick={accept} className="rounded-full">
          Accept
        </Button>
      </div>
    </div>
  );
}
