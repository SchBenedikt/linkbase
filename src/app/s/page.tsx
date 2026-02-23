import { Suspense } from 'react';
import RedirectClient from './redirect-client';

// This page handles redirects for /s?code=...
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_60%)] text-foreground">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <RedirectClient />
    </Suspense>
  );
}
