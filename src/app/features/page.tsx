import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f3f3f1]">
      <header className="container mx-auto px-4 py-6">
        <Link href="/" className="font-headline font-bold text-2xl text-primary">
          BioBloom*
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Features</h1>
          <p className="mt-4 text-lg text-muted-foreground">This page is under construction.</p>
           <Button asChild className="mt-8">
              <Link href="/">Back to Home</Link>
            </Button>
        </div>
      </main>
    </div>
  );
}
