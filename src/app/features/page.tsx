import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Globe, BarChart3, BookOpen, Link2, Sparkles, Palette,
  Quote, HelpCircle, MessageCircle, Pin, Star, Tv, Instagram,
  Music, Youtube, Clock, Timer, MapPin, ShoppingBag,
} from 'lucide-react';

type FeatureItem = {
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
};

const FEATURE_SECTIONS: { label: string; items: FeatureItem[] }[] = [
  {
    label: 'Pages & Content',
    items: [
      { icon: Globe, title: 'Bento Pages', description: 'Drag-and-drop bento grid pages that turn your links into a beautiful, customisable profile.' },
      { icon: BookOpen, title: 'Integrated Blog', description: 'Write and publish blog posts directly on your Linkbase — no third-party platform needed.' },
      { icon: Link2, title: 'Short Links', description: 'Create branded short URLs and track every click in real time.' },
      { icon: BarChart3, title: 'Detailed Analytics', description: 'See which links and pages perform best with real data and insights.' },
      { icon: Sparkles, title: 'AI Themes', description: 'Describe a vibe and get a stunning colour scheme generated in seconds.' },
      { icon: Palette, title: 'Full Design Control', description: 'Fonts, gradients, border radius, card colours — every detail under your control.' },
    ],
  },
  {
    label: 'Social Media Embeds',
    items: [
      { icon: Instagram, title: 'Instagram', description: 'Embed Instagram posts directly on your page.' },
      { icon: Youtube, title: 'YouTube', description: 'Embed YouTube videos with a beautiful player.' },
      { icon: Music, title: 'Spotify & SoundCloud', description: 'Embed tracks and playlists from Spotify and SoundCloud.' },
      { icon: Tv, title: 'TikTok, Twitch & Vimeo', description: 'Embed TikTok videos, live Twitch streams, and Vimeo clips.' },
      { icon: Pin, title: 'Pinterest', description: 'Embed Pinterest pins right on your profile.', badge: 'New' },
      { icon: MessageCircle, title: 'Discord', description: 'Show your Discord server widget and grow your community.', badge: 'New' },
    ],
  },
  {
    label: 'Unique Widgets',
    items: [
      { icon: Quote, title: 'Testimonials', description: 'Show social proof with star-rated quotes from your customers.', badge: 'New' },
      { icon: HelpCircle, title: 'FAQ Accordion', description: 'Add an interactive FAQ section directly on your link page.', badge: 'New' },
      { icon: Clock, title: 'World Clock', description: 'Display a live clock in any time zone.' },
      { icon: Timer, title: 'Countdown Timer', description: 'Count down to product launches, events, or anything else.' },
      { icon: MapPin, title: 'Embedded Map', description: 'Show your location with a Google Maps embed.' },
      { icon: ShoppingBag, title: 'Product Cards', description: 'Feature individual products with images, descriptions, and prices.' },
      { icon: Star, title: 'App Download', description: 'Promote your iOS and Android apps with store badges.' },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-primary">Linkbase*</Link>
          <Button asChild size="sm">
            <Link href="/login">Get Started Free</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Everything you need in one link</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Linkbase is the most powerful link-in-bio platform — with built-in social embeds, AI themes, a blog engine, and unique widgets no one else has.
          </p>
        </div>

        <div className="space-y-14">
          {FEATURE_SECTIONS.map((section) => (
            <div key={section.label}>
              <h2 className="text-xl font-bold mb-6 pb-2 border-b">{section.label}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {section.items.map((item) => (
                  <div key={item.title} className="rounded-2xl border bg-card p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{item.title}</h3>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">{item.badge}</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/login">Start for free</Link>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">No credit card required</p>
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
