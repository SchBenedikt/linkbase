import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="font-bold text-xl text-primary">Linkbase*</Link>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-8">We'd love to hear from you.</p>
        
        <div className="space-y-6 text-sm leading-relaxed">
            <p>
                If you have any questions about Linkbase, encounter any issues, or just want to share your feedback, please don't hesitate to get in touch.
            </p>
            <p>
                The best way to reach us is by email. We'll do our best to get back to you as soon as possible.
            </p>
            
            <div className="pt-4">
                <Button asChild>
                    <a href="mailto:contact@linkbase.app">Email: contact@linkbase.app</a>
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
