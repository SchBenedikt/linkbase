import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles, QrCode, Video, Minus, MessageCircle, Pin,
  Quote, HelpCircle, BarChart3, Palette, Link2, BookOpen,
  Globe, Music, Youtube, Instagram, Clock, Timer, MapPin,
  ShoppingBag, Star, Zap, Shield, Wrench, Bug, Plus,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'See every update, improvement, and new feature added to Linkbase. Stay up to date with our release history.',
  openGraph: {
    title: 'Linkbase Changelog',
    description: 'See every update, improvement, and new feature added to Linkbase.',
    type: 'website',
  },
};

type ChangeKind = 'new' | 'improved' | 'fixed' | 'security';

interface ChangeEntry {
  kind: ChangeKind;
  text: string;
  icon?: React.ElementType;
}

interface Release {
  version: string;
  date: string;
  title: string;
  summary?: string;
  changes: ChangeEntry[];
}

const BADGE_STYLES: Record<ChangeKind, string> = {
  new: 'bg-green-500/15 text-green-600 border-green-500/20',
  improved: 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  fixed: 'bg-amber-500/15 text-amber-700 border-amber-500/20',
  security: 'bg-red-500/15 text-red-600 border-red-500/20',
};

const BADGE_LABELS: Record<ChangeKind, string> = {
  new: 'New',
  improved: 'Improved',
  fixed: 'Fixed',
  security: 'Security',
};

const RELEASES: Release[] = [
  {
    version: '2.5.0',
    date: 'March 2026',
    title: 'Changelog, Search & SEO Boost',
    summary: 'Public changelog page, profile discovery search, and significant SEO improvements across the platform.',
    changes: [
      { kind: 'new', text: 'Public Changelog page to track all updates and new features.', icon: Sparkles },
      { kind: 'new', text: 'Profile Search page — discover public Linkbase profiles by name or username.', icon: Globe },
      { kind: 'improved', text: 'Sitemap now includes /changelog and /search for better indexing.' },
      { kind: 'improved', text: 'Open Graph metadata added to Changelog and Search pages.' },
      { kind: 'improved', text: 'Footer navigation updated with Changelog link across all public pages.' },
    ],
  },
  {
    version: '2.4.0',
    date: 'February 2026',
    title: 'LinkedIn Card, QR Code & More Embeds',
    summary: 'New LinkedIn profile card, QR Code generator card, custom video player, and section header divider.',
    changes: [
      { kind: 'new', text: 'LinkedIn profile embed card.', icon: Link2 },
      { kind: 'new', text: 'QR Code card: auto-generate a QR code for any URL.', icon: QrCode },
      { kind: 'new', text: 'Video player card: embed MP4 / WebM files directly on your page.', icon: Video },
      { kind: 'new', text: 'Section Header card for organizing page content with titled dividers.', icon: Minus },
      { kind: 'improved', text: 'Card type count reaches 31 distinct widget types.' },
    ],
  },
  {
    version: '2.3.0',
    date: 'January 2026',
    title: 'Pinterest, Discord & Community Widgets',
    summary: 'Embed Pinterest pins and Discord servers directly on your link page.',
    changes: [
      { kind: 'new', text: 'Pinterest embed card.', icon: Pin },
      { kind: 'new', text: 'Discord server widget card.', icon: MessageCircle },
      { kind: 'new', text: 'Testimonials card with star ratings.', icon: Quote },
      { kind: 'new', text: 'FAQ Accordion card for adding interactive Q&A sections.', icon: HelpCircle },
    ],
  },
  {
    version: '2.2.0',
    date: 'December 2025',
    title: 'AI Theme Generator & Custom CSS',
    summary: 'Describe a vibe and get a full colour palette. Power users can now inject custom CSS.',
    changes: [
      { kind: 'new', text: 'AI theme generator powered by Google Gemini.', icon: Sparkles },
      { kind: 'new', text: 'Custom CSS field for full styling control on public pages.', icon: Palette },
      { kind: 'new', text: 'Card entrance animation styles: fade, slide, scale.', icon: Zap },
      { kind: 'improved', text: 'Theme switcher now supports light, dark, and system modes.' },
      { kind: 'improved', text: 'Appearance editor redesigned for a better editing experience.' },
    ],
  },
  {
    version: '2.1.0',
    date: 'November 2025',
    title: 'Short Links, Analytics & URL Shortener',
    summary: 'Create branded short links, track every click, and analyse your performance.',
    changes: [
      { kind: 'new', text: 'URL shortener with custom short codes.', icon: Link2 },
      { kind: 'new', text: 'Click-through analytics per short link.', icon: BarChart3 },
      { kind: 'new', text: 'Trending links public page.', icon: BarChart3 },
      { kind: 'new', text: 'Link scheduling — set start and end dates for visibility.', icon: Clock },
      { kind: 'improved', text: 'Analytics dashboard now shows page view history.' },
    ],
  },
  {
    version: '2.0.0',
    date: 'October 2025',
    title: 'Bento Grid Redesign & Blog Engine',
    summary: 'Full visual redesign with the bento grid layout and a built-in blog platform.',
    changes: [
      { kind: 'new', text: 'Bento grid drag-and-drop page builder.', icon: Globe },
      { kind: 'new', text: 'Integrated blog engine — write and publish posts on your profile.', icon: BookOpen },
      { kind: 'new', text: 'World Clock and Countdown Timer widgets.', icon: Timer },
      { kind: 'new', text: 'Embedded Google Map card.', icon: MapPin },
      { kind: 'new', text: 'Product card with image, price, and description.', icon: ShoppingBag },
      { kind: 'new', text: 'App Download card with App Store and Google Play badges.', icon: Star },
      { kind: 'improved', text: 'Completely redesigned homepage and landing page.' },
    ],
  },
  {
    version: '1.3.0',
    date: 'September 2025',
    title: 'Social Embeds: TikTok, Twitch, SoundCloud & Vimeo',
    summary: 'Even more social media platforms natively embedded.',
    changes: [
      { kind: 'new', text: 'TikTok video embed card.', icon: Video },
      { kind: 'new', text: 'Twitch live channel embed card.', icon: Youtube },
      { kind: 'new', text: 'SoundCloud player embed card.', icon: Music },
      { kind: 'new', text: 'Vimeo video embed card.', icon: Video },
      { kind: 'improved', text: 'Instagram embed card stability improved.' },
    ],
  },
  {
    version: '1.2.0',
    date: 'August 2025',
    title: 'Instagram, Spotify & YouTube Embeds',
    summary: 'Embed your social content directly on your link page.',
    changes: [
      { kind: 'new', text: 'Instagram post embed.', icon: Instagram },
      { kind: 'new', text: 'Spotify track & playlist embed.', icon: Music },
      { kind: 'new', text: 'YouTube video embed.', icon: Youtube },
      { kind: 'new', text: 'GitHub profile card.', icon: Globe },
      { kind: 'new', text: 'Audio file player card.', icon: Music },
      { kind: 'new', text: 'Calendly booking embed card.', icon: Clock },
    ],
  },
  {
    version: '1.1.0',
    date: 'July 2025',
    title: 'Donation Card, Contact Info & Profile Mentions',
    summary: 'More card types and improved personalisation.',
    changes: [
      { kind: 'new', text: 'Donation card with custom button text and URL.', icon: Plus },
      { kind: 'new', text: 'Contact Info card with email and phone fields.' },
      { kind: 'new', text: 'Profile mention card to reference another Linkbase user.' },
      { kind: 'new', text: 'Image card for displaying custom images.' },
      { kind: 'new', text: 'Text card for plain text or markdown-style content.' },
      { kind: 'improved', text: 'Page editor UX improvements and drag-and-drop reordering.' },
    ],
  },
  {
    version: '1.0.0',
    date: 'June 2025',
    title: 'Initial Launch 🎉',
    summary: 'Linkbase goes live! Create your free link-in-bio page in seconds.',
    changes: [
      { kind: 'new', text: 'Link-in-bio page builder with Google login.' },
      { kind: 'new', text: 'Public profile pages at linkbase.io/<username>.' },
      { kind: 'new', text: 'Link card with title, URL, and thumbnail.' },
      { kind: 'new', text: 'Draft / Published page status.' },
      { kind: 'new', text: 'Dark mode support.', icon: Palette },
      { kind: 'security', text: 'Firestore security rules: only owners can write their own data.', icon: Shield },
    ],
  },
];

function KindBadge({ kind }: { kind: ChangeKind }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${BADGE_STYLES[kind]}`}>
      {BADGE_LABELS[kind]}
    </span>
  );
}

export default function ChangelogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b sticky top-0 z-40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-primary">Linkbase*</Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
            <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/changelog" className="text-foreground font-semibold">Changelog</Link>
          </nav>
          <Link href="/login">
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs px-3 py-1">
              Get Started Free
            </Badge>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        {/* Hero */}
        <div className="mb-12">
          <Badge className="mb-4 rounded-full px-4 py-1.5 bg-primary/10 text-primary border-primary/20 text-sm">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Release History
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter mb-4">Changelog</h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Every update, every improvement, every new feature — all in one place.
            We ship fast and keep you in the loop.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-12">
          {RELEASES.map((release, index) => (
            <article key={release.version} className="relative">
              {/* Connector line */}
              {index < RELEASES.length - 1 && (
                <div className="absolute left-[11px] top-10 bottom-0 w-px bg-border" aria-hidden />
              )}

              <div className="flex gap-4">
                {/* Timeline dot */}
                <div className="mt-1 flex-shrink-0">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    index === 0 ? 'border-primary bg-primary' : 'border-border bg-background'
                  }`}>
                    {index === 0 && <Sparkles className="h-3 w-3 text-primary-foreground" />}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">v{release.version}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <time className="text-xs text-muted-foreground">{release.date}</time>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight mb-1">{release.title}</h2>
                  {release.summary && (
                    <p className="text-sm text-muted-foreground mb-4">{release.summary}</p>
                  )}

                  <ul className="space-y-2">
                    {release.changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <KindBadge kind={change.kind} />
                        <span className="text-foreground/90 leading-snug pt-0.5">{change.text}</span>
                      </li>
                    ))}
                  </ul>

                  {index < RELEASES.length - 1 && <Separator className="mt-8" />}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border bg-card p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Ready to get started?</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Create your free Linkbase profile and use every feature listed above — for free, forever.
          </p>
          <Link href="/login">
            <Badge className="cursor-pointer rounded-full px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold">
              Create your free page →
            </Badge>
          </Link>
        </div>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-8 flex flex-wrap gap-4 sm:gap-6 text-sm text-muted-foreground justify-between items-center">
          <Link href="/" className="font-bold text-foreground">Linkbase*</Link>
          <nav className="flex flex-wrap gap-4 sm:gap-6">
            <Link href="/features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/changelog" className="hover:text-foreground transition-colors font-medium text-foreground">Changelog</Link>
            <Link href="/search" className="hover:text-foreground transition-colors">Discover</Link>
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
