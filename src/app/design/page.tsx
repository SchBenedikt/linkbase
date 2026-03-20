import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Palette, Type, Layout, Sparkles, Circle, Square,
  Minus, Plus, ArrowRight, Check, Globe, Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Design Guidelines',
  description: 'Explore Linkbase design system, UI patterns, color schemes, typography, and component guidelines.',
  openGraph: {
    title: 'Linkbase Design Guidelines',
    description: 'Our design system and UI patterns that power Linkbase.',
    type: 'website',
  },
};

export default function DesignPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b sticky top-0 z-40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-primary">Linkbase*</Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
            <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="/changelog" className="text-muted-foreground hover:text-foreground transition-colors">Changelog</Link>
            <Link href="/design" className="text-foreground font-semibold">Design</Link>
          </nav>
          <Link href="/login">
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs px-3 py-1">
              Get Started Free
            </Badge>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero */}
        <div className="mb-16">
          <Badge className="mb-4 rounded-full px-4 py-1.5 bg-primary/10 text-primary border-primary/20 text-sm">
            <Palette className="h-3.5 w-3.5 mr-1.5" />
            Design System
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter mb-4">Design Guidelines</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore the design principles, color schemes, typography, and component patterns that make Linkbase beautiful, consistent, and user-friendly.
          </p>
        </div>

        {/* Color Palette */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Color Palette</h2>
          </div>
          <p className="text-muted-foreground mb-8">
            Our color system is built on CSS variables, making theming seamless. Every color adapts to light and dark modes automatically.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Colors */}
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Primary Colors</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary border shadow-sm" />
                  <div>
                    <p className="text-sm font-semibold">Primary</p>
                    <code className="text-xs text-muted-foreground">var(--primary)</code>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary-foreground border shadow-sm" />
                  <div>
                    <p className="text-sm font-semibold">Primary Foreground</p>
                    <code className="text-xs text-muted-foreground">var(--primary-foreground)</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Accent & Background */}
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Accent & Background</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-accent border shadow-sm" />
                  <div>
                    <p className="text-sm font-semibold">Accent</p>
                    <code className="text-xs text-muted-foreground">var(--accent)</code>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-muted border shadow-sm" />
                  <div>
                    <p className="text-sm font-semibold">Muted</p>
                    <code className="text-xs text-muted-foreground">var(--muted)</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Semantic Colors */}
            <div className="rounded-2xl border bg-card p-6 md:col-span-2">
              <h3 className="font-semibold mb-4">Semantic Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-green-500 border shadow-sm" />
                  <div>
                    <p className="text-xs font-semibold">Success</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-destructive border shadow-sm" />
                  <div>
                    <p className="text-xs font-semibold">Destructive</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-amber-500 border shadow-sm" />
                  <div>
                    <p className="text-xs font-semibold">Warning</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-blue-500 border shadow-sm" />
                  <div>
                    <p className="text-xs font-semibold">Info</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Typography */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Type className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Typography</h2>
          </div>
          <p className="text-muted-foreground mb-8">
            Clear, legible, and expressive. Our type system uses system fonts for speed and consistency across platforms.
          </p>

          <div className="rounded-2xl border bg-card p-8 space-y-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tighter mb-2">Heading 1 (4xl / extrabold / tight)</h1>
              <code className="text-xs text-muted-foreground">text-4xl font-extrabold tracking-tighter</code>
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Heading 2 (3xl / bold / tight)</h2>
              <code className="text-xs text-muted-foreground">text-3xl font-bold tracking-tight</code>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Heading 3 (2xl / bold)</h3>
              <code className="text-xs text-muted-foreground">text-2xl font-bold</code>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-2">Heading 4 (xl / semibold)</h4>
              <code className="text-xs text-muted-foreground">text-xl font-semibold</code>
            </div>
            <div>
              <p className="text-base mb-2">Body text (base / normal)</p>
              <code className="text-xs text-muted-foreground">text-base</code>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Small text (sm / muted-foreground)</p>
              <code className="text-xs text-muted-foreground">text-sm text-muted-foreground</code>
            </div>
            <div>
              <code className="text-xs font-mono bg-muted px-2 py-1 rounded">Code / Monospace (xs / mono)</code>
              <p className="text-xs text-muted-foreground mt-2">text-xs font-mono</p>
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Spacing & Layout */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Layout className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Spacing & Layout</h2>
          </div>
          <p className="text-muted-foreground mb-8">
            Consistent spacing creates rhythm and hierarchy. We use Tailwind's spacing scale (4px base unit).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Common Spacing</h3>
              <div className="space-y-3">
                {[
                  { size: '2', px: '8px', name: 'gap-2, p-2' },
                  { size: '4', px: '16px', name: 'gap-4, p-4' },
                  { size: '6', px: '24px', name: 'gap-6, p-6' },
                  { size: '8', px: '32px', name: 'gap-8, p-8' },
                  { size: '12', px: '48px', name: 'gap-12, p-12' },
                ].map(({ size, px, name }) => (
                  <div key={size} className="flex items-center gap-4">
                    <div className={`h-8 bg-primary/20 rounded`} style={{ width: px }} />
                    <div>
                      <p className="text-sm font-semibold">{px}</p>
                      <code className="text-xs text-muted-foreground">{name}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Border Radius</h3>
              <div className="space-y-3">
                {[
                  { name: 'rounded-md', value: '6px' },
                  { name: 'rounded-lg', value: '8px' },
                  { name: 'rounded-xl', value: '12px' },
                  { name: 'rounded-2xl', value: '16px' },
                  { name: 'rounded-3xl', value: '24px' },
                  { name: 'rounded-full', value: '9999px' },
                ].map(({ name, value }) => (
                  <div key={name} className="flex items-center gap-4">
                    <div className={`h-12 w-12 bg-primary/20 border ${name}`} />
                    <div>
                      <p className="text-sm font-semibold">{value}</p>
                      <code className="text-xs text-muted-foreground">{name}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Component Patterns */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Component Patterns</h2>
          </div>
          <p className="text-muted-foreground mb-8">
            Reusable UI patterns ensure consistency and speed up development.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buttons */}
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Buttons</h3>
              <div className="space-y-3">
                <Button className="w-full">Primary Button</Button>
                <Button variant="outline" className="w-full">Outline Button</Button>
                <Button variant="ghost" className="w-full">Ghost Button</Button>
                <Button variant="destructive" className="w-full">Destructive Button</Button>
              </div>
            </div>

            {/* Badges */}
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Badges</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge className="bg-green-500/15 text-green-600 border-green-500/20">Success</Badge>
                <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/20">Info</Badge>
              </div>
            </div>

            {/* Cards */}
            <div className="rounded-2xl border bg-card p-6 md:col-span-2">
              <h3 className="font-semibold mb-4">Card Styles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border bg-card p-4">
                  <p className="text-sm font-semibold mb-1">Default Card</p>
                  <p className="text-xs text-muted-foreground">Standard border and background</p>
                </div>
                <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm font-semibold mb-1">Highlighted Card</p>
                  <p className="text-xs text-muted-foreground">With primary accent</p>
                </div>
                <div className="rounded-2xl border bg-muted p-4">
                  <p className="text-sm font-semibold mb-1">Muted Card</p>
                  <p className="text-xs text-muted-foreground">Subtle background</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Design Principles */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Design Principles</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Circle,
                title: 'Simple & Intuitive',
                desc: 'Every interface should feel natural. No learning curve, just clarity.',
              },
              {
                icon: Globe,
                title: 'Accessible by Default',
                desc: 'Semantic HTML, keyboard navigation, and ARIA labels are non-negotiable.',
              },
              {
                icon: Zap,
                title: 'Fast & Responsive',
                desc: 'Instant feedback, smooth animations, zero layout shifts.',
              },
              {
                icon: Palette,
                title: 'Beautiful & Functional',
                desc: 'Design should delight, but never at the cost of usability.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border bg-card p-6 flex gap-4">
                <div className="p-3 bg-primary/10 rounded-xl h-fit">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border bg-card p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Start building with Linkbase</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Use our design system to create your own beautiful link-in-bio page — for free, forever.
          </p>
          <Link href="/login">
            <Button className="rounded-full px-6 py-2">
              Create your free page <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-8 flex flex-wrap gap-4 sm:gap-6 text-sm text-muted-foreground justify-between items-center">
          <Link href="/" className="font-bold text-foreground">Linkbase*</Link>
          <nav className="flex flex-wrap gap-4 sm:gap-6">
            <Link href="/features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/changelog" className="hover:text-foreground transition-colors">Changelog</Link>
            <Link href="/design" className="hover:text-foreground transition-colors font-medium text-foreground">Design</Link>
            <Link href="/impressum" className="hover:text-foreground transition-colors">Legal Notice</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
          </nav>
          <p className="text-xs">© 2025 Linkbase*</p>
        </div>
      </footer>
    </div>
  );
}
