import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const FREE_FEATURES = [
  'Unlimited bento pages',
  'Unlimited short links',
  'Built-in blog',
  'Basic analytics',
  'Social media embeds (Instagram, TikTok, YouTube, Spotify & more)',
  'Testimonial & FAQ widgets',
  'Discord & Pinterest cards',
  'AI theme generator',
  'Custom domain support',
  'App Download card',
];

const PRO_FEATURES = [
  'Everything in Free',
  'Advanced analytics & heatmaps',
  'Priority support',
  'Remove "Powered by Linkbase" badge',
  'Custom email domain for notifications',
  'Early access to new features',
];

function PlanCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  ctaHref,
  highlighted = false,
  badge,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={cn(
        'relative rounded-3xl border p-8 flex flex-col gap-6',
        highlighted
          ? 'bg-primary text-primary-foreground border-primary shadow-2xl scale-[1.03]'
          : 'bg-card border-border',
      )}
    >
      {badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <Badge className={cn('px-4 py-1 text-xs font-bold rounded-full', highlighted ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground')}>
            {badge}
          </Badge>
        </div>
      )}

      <div>
        <p className={cn('text-sm font-semibold uppercase tracking-widest mb-2', highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{name}</p>
        <div className="flex items-end gap-1">
          <span className="text-5xl font-extrabold tracking-tighter">{price}</span>
          <span className={cn('text-sm mb-2', highlighted ? 'text-primary-foreground/60' : 'text-muted-foreground')}>{period}</span>
        </div>
        <p className={cn('text-sm mt-2', highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{description}</p>
      </div>

      <Button
        asChild
        size="lg"
        className={cn(
          'rounded-full font-semibold',
          highlighted ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90' : '',
        )}
        variant={highlighted ? 'default' : 'outline'}
      >
        <Link href={ctaHref}>{cta}</Link>
      </Button>

      <ul className="flex flex-col gap-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check className={cn('h-4 w-4 mt-0.5 flex-shrink-0', highlighted ? 'text-primary-foreground' : 'text-primary')} />
            <span className={highlighted ? 'text-primary-foreground/85' : ''}>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-primary">Linkbase*</Link>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 text-center px-4">
          <Badge className="mb-4 rounded-full px-4 py-1.5 bg-primary/10 text-primary border-primary/20">
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            Simple pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter mb-4">
            Free forever — no tricks
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Linkbase is completely free while we build the best product possible.
            A Pro plan with advanced features is coming soon.
          </p>
        </section>

        {/* Plans */}
        <section className="pb-24 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <PlanCard
                name="Free"
                price="€0"
                period="/ forever"
                description="Everything you need to create a stunning link-in-bio."
                features={FREE_FEATURES}
                cta="Get started for free"
                ctaHref="/login"
              />
              <PlanCard
                name="Pro"
                price="Coming soon"
                period=""
                description="Advanced tools for creators who want more power."
                features={PRO_FEATURES}
                cta="Join the waitlist"
                ctaHref="/contact"
                highlighted
                badge="Coming soon"
              />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-10">
              Questions? <Link href="/contact" className="underline hover:text-foreground">Get in touch</Link>
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t">
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
