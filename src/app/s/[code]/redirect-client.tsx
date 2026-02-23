'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RedirectClient() {
  const params = useParams();
  const code = params.code as string;
  const firestore = useFirestore();
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'not-found' | 'error'>('loading');
  const [targetUrl, setTargetUrl] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!code || !firestore || code === '_placeholder') {
      setStatus('not-found');
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const resolve = async () => {
      try {
        const linkRef = doc(firestore, 'short_link_public', code);
        const snap = await getDoc(linkRef);

        if (!snap.exists()) {
          setStatus('not-found');
          return;
        }

        const data = snap.data();
        const url: string = data.originalUrl;
        try {
          const parsed = new URL(url);
          if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('invalid-protocol');
          }
        } catch {
          setErrorMessage('This link does not point to a valid URL.');
          setStatus('error');
          return;
        }

        if (cancelled) return;
        setTargetUrl(url);
        setStatus('redirecting');

        // Track click (fire-and-forget) by incrementing the public counter
        setDoc(linkRef, { clickCount: increment(1) }, { merge: true }).catch(() => {});

        // Countdown then redirect
        let t = 3;
        intervalId = setInterval(() => {
          t -= 1;
          setCountdown(t);
          if (t <= 0) {
            if (intervalId) clearInterval(intervalId);
            window.location.replace(url);
          }
        }, 1000);

        timeoutId = setTimeout(() => {
          window.location.replace(url);
        }, 3500);
      } catch {
        setErrorMessage('Could not resolve this link. Please try again later.');
        setStatus('error');
      }
    };

    resolve();
    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [code, firestore]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.15),transparent_55%)] text-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Resolving link…</p>
      </div>
    );
  }

  if (status === 'not-found') {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_60%)] text-foreground">
        <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-5 px-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold">Link not found</h1>
          <p className="text-muted-foreground">This short link does not exist or may have been deleted.</p>
          <Button asChild variant="outline">
            <Link href="/">Go to homepage</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,hsl(var(--secondary)/0.18),transparent_60%)] text-foreground">
        <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-5 px-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">{errorMessage || 'Could not resolve this link. Please try again later.'}</p>
          <Button asChild variant="outline">
            <Link href="/">Go to homepage</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Redirecting state
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.15),transparent_60%)] text-foreground">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">
            {countdown > 0 ? countdown : ''}
          </span>
        </div>
        <div>
          <p className="text-lg font-semibold">Redirecting you in {countdown > 0 ? countdown : 0}s…</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm break-all">{targetUrl}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild size="sm">
            <a href={targetUrl} rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Go now
            </a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/">Back to Linkbase</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
