'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error caught:', error);
    
    // Don't log the content.js errors as they're browser extension related
    if (!error.message.includes('content.js') && !error.message.includes('runtime.lastError')) {
      // Log actual application errors
      console.error('Application error:', {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
      });
    }
  }, [error]);

  // Filter out browser extension errors
  if (error.message.includes('content.js') || error.message.includes('runtime.lastError')) {
    return null; // Don't render anything for browser extension errors
  }

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                We encountered an unexpected error. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground font-mono">
                  {error.message || 'Unknown error occurred'}
                </p>
              </div>
              <Button 
                onClick={reset} 
                className="w-full"
                variant="default"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try again
              </Button>
              <Button 
                onClick={() => window.location.href = '/'} 
                className="w-full"
                variant="outline"
              >
                Go to homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
