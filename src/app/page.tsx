'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Palette, Link as LinkIcon, BarChart3, MoveRight, BookOpen,
  UserPlus, Share2, Globe, ExternalLink, TrendingUp,
  Sparkles, ArrowRight, Check
} from 'lucide-react';
import { useUser } from '@/firebase';
import { UserNav } from '@/components/user-nav';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { HeroShowcase } from '@/components/hero-showcase';

/* ─── tiny helpers ──────────────────────────────────────────────────── */
function BentoCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'rounded-3xl border border-border/60 bg-card p-8 flex flex-col gap-4 overflow-hidden relative',
      className
    )}>
      {children}
    </div>
  );
}

/* ─── mini analytics sparkline ──────────────────────────────────────── */
function MiniChart() {
  const data = [30, 55, 40, 70, 60, 85, 72, 95];
  const max = Math.max(...data);
  const w = 160, h = 48;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12 text-primary" fill="none">
      <polyline points={pts} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill="currentColor" opacity="0.1" />
    </svg>
  );
}

/* ─── mini link card ─────────────────────────────────────────────────── */
function MiniLinkCard({ icon, label, clicks }: { icon: React.ReactNode; label: string; clicks: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-background/60 border border-border/60 px-3 py-2.5">
      <span className="text-primary">{icon}</span>
      <span className="text-sm font-medium flex-1 truncate">{label}</span>
      <span className="text-xs text-muted-foreground font-mono">{clicks} clicks</span>
    </div>
  );
}

const MOCK_SHORT_LINKS = [
  { icon: <ExternalLink className="h-3.5 w-3.5" />, label: 'linkbase.io/s/launch', clicks: 248 },
  { icon: <ExternalLink className="h-3.5 w-3.5" />, label: 'linkbase.io/s/portfolio', clicks: 91 },
] as const;

const MOCK_ANALYTICS_STATS = [
  { label: 'Total Clicks', value: '1,482' },
  { label: 'Pages', value: '6' },
  { label: 'Short Links', value: '14' },
] as const;

const HOW_IT_WORKS_STEPS = [
  { icon: UserPlus, step: '1', label: 'Create Account', desc: 'Sign up in seconds — just your email, no credit card.' },
  { icon: Palette, step: '2', label: 'Build your Page', desc: 'Add links, write posts, customize colors. Drag, drop, done.' },
  { icon: Share2, step: '3', label: 'Share everywhere', desc: 'One link for your Instagram, email, or business card.' },
] as const;

export default function LandingPage() {
  const { user, isUserLoading } = useUser();

  const renderAuthButtons = () => {
    if (isUserLoading) return <Skeleton className="h-10 w-24 rounded-full" />;
    if (user) {
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild className="rounded-full hidden sm:flex">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <ThemeToggle />
          <UserNav />
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" asChild className="rounded-full hover:bg-accent/80">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link href="/login">Sign up Free</Link>
        </Button>
      </div>
    );
  };

  return (
    <div className="text-foreground bg-background flex flex-col min-h-screen">

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header className="fixed top-4 z-50 w-full px-4">
        <div className="container mx-auto">
          <nav className="bg-background/30 backdrop-blur-md w-full rounded-full border p-2 flex items-center justify-between">
            <Link href="/" className="font-headline font-bold text-xl pl-4 text-primary">
              Linkbase*
            </Link>
            {renderAuthButtons()}
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="bg-accent text-accent-foreground min-h-screen flex items-center pt-24 pb-16 px-4">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6 items-start">
              <Badge className="rounded-full px-4 py-1.5 bg-primary/10 text-primary border-primary/20 text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Your link-in-bio, reimagined
              </Badge>
              <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter leading-[0.95]">
                One link.<br />
                <span className="text-primary">All of you.</span>
              </h1>
              <p className="max-w-md text-lg text-accent-foreground/75 leading-relaxed">
                Share your pages, blog posts, and short links — all from a single beautiful profile. No code needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Button asChild size="lg" className="h-13 rounded-full text-base font-bold px-8">
                  <Link href="/login">Get Started for Free</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-13 rounded-full text-base border-accent-foreground/20 hover:bg-accent-foreground/5">
                  <Link href="/login" className="flex items-center gap-2">
                    See a demo <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-accent-foreground/60">
                {['Free forever plan', 'No credit card', 'Custom domain ready'].map(t => (
                  <li key={t} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-primary" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <HeroShowcase />
            </div>
          </div>
        </section>

        {/* ── Bento Features ──────────────────────────────────────────── */}
        <section className="py-20 sm:py-28 bg-background">
          <div className="container mx-auto px-4">

            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter">
                Everything in one place
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                From bento pages to a built-in blog and short links — Linkbase is your complete digital home.
              </p>
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">

              {/* Bento Pages — large */}
              <BentoCard className="md:col-span-2 bg-primary text-primary-foreground border-primary">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-foreground/15 rounded-xl">
                    <Globe className="h-5 w-5" />
                  </div>
                  <Badge className="bg-primary-foreground/15 text-primary-foreground border-primary-foreground/20 text-xs">Most popular</Badge>
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-bold">Bento Pages</h3>
                  <p className="text-primary-foreground/75 mt-1 text-sm leading-relaxed">
                    Drag-and-drop bento grid that turns your links into a beautiful, customizable profile. Embed Spotify, YouTube, and more.
                  </p>
                </div>
                {/* mini bento mockup */}
                <div className="grid grid-cols-3 gap-2 mt-2 opacity-80">
                  <div className="col-span-2 h-14 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10" />
                  <div className="h-14 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10" />
                  <div className="h-8 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10" />
                  <div className="h-8 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10" />
                  <div className="h-8 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10" />
                </div>
                <Link href="/login" className="text-sm font-semibold inline-flex items-center gap-1.5 text-primary-foreground/80 hover:text-primary-foreground mt-auto">
                  Create your page <MoveRight className="h-4 w-4" />
                </Link>
              </BentoCard>

              {/* AI Themes */}
              <BentoCard className="bg-muted">
                <div className="p-2 bg-foreground/10 rounded-xl w-fit">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold">AI Themes</h3>
                  <p className="text-muted-foreground text-sm mt-1">Describe a vibe, get a stunning color scheme in seconds.</p>
                </div>
                {/* color swatches */}
                <div className="flex gap-2 mt-auto">
                  {['bg-primary', 'bg-accent', 'bg-secondary', 'bg-destructive/70', 'bg-muted-foreground/40'].map((c, i) => (
                    <div key={i} className={cn('h-7 w-7 rounded-full', c)} />
                  ))}
                </div>
              </BentoCard>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">

              {/* Short Links */}
              <BentoCard>
                <div className="p-2 bg-foreground/10 rounded-xl w-fit">
                  <LinkIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold">Short Links</h3>
                  <p className="text-muted-foreground text-sm mt-1">Create branded short URLs and track every click in real time.</p>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  {MOCK_SHORT_LINKS.map(({ icon, label, clicks }) => (
                    <MiniLinkCard key={label} icon={icon} label={label} clicks={clicks} />
                  ))}
                </div>
              </BentoCard>

              {/* Analytics — large */}
              <BentoCard className="md:col-span-2 bg-muted">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-foreground/10 rounded-xl w-fit">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    <span>+24% this week</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold">Detailed Analytics</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    See which links and pages perform best. Real data, real insights.
                  </p>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Clicks</span>
                    <span>Last 7 days</span>
                  </div>
                  <MiniChart />
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {MOCK_ANALYTICS_STATS.map(stat => (
                      <div key={stat.label} className="text-center rounded-xl bg-background/60 py-3">
                        <p className="text-lg font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </BentoCard>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Blog — large */}
              <BentoCard className="md:col-span-2">
                <div className="p-2 bg-foreground/10 rounded-xl w-fit">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold">Integrated Blog</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Write and publish articles directly on your Linkbase. No third-party platform needed.
                  </p>
                </div>
                <div className="flex flex-col gap-2 mt-2 rounded-xl bg-muted p-4">
                  <Badge variant="secondary" className="w-fit text-xs">Productivity</Badge>
                  <p className="font-semibold text-sm">How to Build a Second Brain</p>
                  <div className="flex gap-1 mt-1">
                    <div className="h-2 rounded-full bg-muted-foreground/20 flex-1" />
                    <div className="h-2 rounded-full bg-muted-foreground/20 w-2/3" />
                  </div>
                  <div className="flex gap-1">
                    <div className="h-2 rounded-full bg-muted-foreground/20 w-3/4" />
                    <div className="h-2 rounded-full bg-muted-foreground/20 flex-1" />
                  </div>
                </div>
                <Link href="/login" className="text-sm font-semibold inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground mt-auto">
                  Start writing <MoveRight className="h-4 w-4" />
                </Link>
              </BentoCard>

              {/* Custom Design */}
              <BentoCard className="bg-muted">
                <div className="p-2 bg-foreground/10 rounded-xl w-fit">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold">Design without limits</h3>
                  <p className="text-muted-foreground text-sm mt-1">Fonts, gradients, borders — every detail under your control.</p>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-auto">
                  {['rounded-none', 'rounded-md', 'rounded-2xl'].map((r, i) => (
                    <div key={i} className={cn('h-10 bg-primary/20 border border-primary/30', r)} />
                  ))}
                </div>
              </BentoCard>
            </div>
          </div>
        </section>

        {/* ── How It Works ────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28 bg-card text-card-foreground">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter">
                Up and running in minutes
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Three simple steps to your own slice of the internet.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* connector line */}
              <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-border z-0" />
              {HOW_IT_WORKS_STEPS.map(({ icon: Icon, step, label, desc }) => (
                <div key={step} className="relative z-10 flex flex-col items-center text-center gap-4 p-8 rounded-3xl bg-background border border-border/60">
                  <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary text-primary-foreground text-xl font-black font-headline">
                    {step}
                  </div>
                  <div className="p-2 bg-foreground/5 rounded-full -mt-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-headline text-xl font-bold">{label}</h3>
                  <p className="text-muted-foreground text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter">
              Ready to own your corner of the internet?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/75 max-w-xl mx-auto">
              Join thousands of creators who use Linkbase to share their work, thoughts, and personality.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="h-13 rounded-full text-base font-bold px-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <Link href="/login">Start for free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-13 rounded-full text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link href="/login">View demo</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-primary-foreground/50">No credit card required · Free plan forever</p>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="font-headline font-bold text-xl text-foreground">
            Linkbase*
          </Link>
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm font-medium">
            <Link href="/features" className="text-muted-foreground hover:text-foreground">Features</Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
            <Link href="/impressum" className="text-muted-foreground hover:text-foreground">Legal Notice</Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link href="/cookies" className="text-muted-foreground hover:text-foreground">Cookies</Link>
          </nav>
          <p className="text-sm text-muted-foreground">© 2025 Linkbase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

