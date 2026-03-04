import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="font-bold text-xl text-primary">Linkbase*</Link>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">No Contact Available</h1>
        <p className="text-muted-foreground mb-8">This is a personal platform without contact options.</p>
        
        <div className="space-y-6 text-sm leading-relaxed">
            <p>
                This is a personal link management platform operated as a private project. 
                No contact options are available for this service.
            </p>
            <p>
                If you encounter technical issues, please try refreshing the page or checking your internet connection.
            </p>
            
            <div className="pt-4">
                <p className="text-muted-foreground">
                    For legal matters, please refer to the <Link href="/impressum" className="text-primary underline">Legal Notice</Link> page.
                </p>
            </div>
        </div>

      </main>
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-8 flex flex-wrap gap-4 sm:gap-6 text-sm text-muted-foreground">
          <Link href="/features" className="hover:text-foreground">Features</Link>
          <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link href="/impressum" className="hover:text-foreground">Legal Notice</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/cookies" className="hover:text-foreground">Cookies</Link>
        </div>
      </footer>
    </div>
  );
}
