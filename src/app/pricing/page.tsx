import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="font-bold text-xl text-primary">Linkbase*</Link>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Pricing</h1>
        <p className="text-muted-foreground mb-8">Simple, transparent pricing.</p>
        
        <div className="space-y-6 text-sm leading-relaxed">
            <p>
                Currently, Linkbase is completely free to use! 
            </p>
            <p>
                We are focused on building the best product possible. While we may introduce premium features in the future, our core offering will always remain accessible.
            </p>
            
            <div className="pt-4">
                <Button asChild>
                    <Link href="/login">Start for Free</Link>
                </Button>
            </div>
        </div>

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
