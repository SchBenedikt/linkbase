import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="font-bold text-xl text-primary">Linkbase*</Link>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Features</h1>
        <p className="text-muted-foreground mb-8">Discover what makes Linkbase special.</p>
        
        <div className="space-y-6 text-sm leading-relaxed">
            <p>
                We are hard at work building a platform that is both powerful and a joy to use.
                This page will soon be updated with a detailed overview of all our features.
            </p>
            <p>
                In the meantime, feel free to explore the app by creating a free account.
            </p>
            
            <div className="pt-4">
                <Button asChild>
                    <Link href="/login">Get Started</Link>
                </Button>
            </div>
        </div>
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
