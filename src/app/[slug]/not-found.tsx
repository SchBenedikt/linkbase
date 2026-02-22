import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The link you're looking for doesn't exist or hasn't been created yet.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          
          <Button asChild variant="outline">
            <Link href="/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Create Your Page
            </Link>
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-8">
          Want to create your own link-in-bio page?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Get started for free
          </Link>
        </p>
      </div>
    </div>
  );
}
