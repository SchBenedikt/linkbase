import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles, Palette, Music, Briefcase, Code, Heart,
  Coffee, Camera, Gamepad2, GraduationCap, ArrowRight,
  Globe, Instagram, Twitter, Youtube, Linkedin,
} from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Demo Profiles',
  description: 'Explore example Linkbase profiles showcasing different use cases, styles, and card types.',
  openGraph: {
    title: 'Linkbase Demo Profiles',
    description: 'See what your Linkbase profile could look like.',
    type: 'website',
  },
};

const DEMO_PROFILES = [
  {
    id: 'creative-designer',
    name: 'Sarah Chen',
    role: 'Creative Designer',
    icon: Palette,
    color: 'from-pink-500 to-purple-500',
    bgColor: 'bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20',
    description: 'Portfolio with image gallery, testimonials, and contact info.',
    tags: ['Design', 'Portfolio', 'Creative'],
    features: ['Image Gallery', 'Testimonials', 'Contact Form', 'Social Links'],
  },
  {
    id: 'musician',
    name: 'Alex Rivers',
    role: 'Musician & Producer',
    icon: Music,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
    description: 'Spotify embeds, YouTube videos, tour dates, and merch links.',
    tags: ['Music', 'Artist', 'Entertainment'],
    features: ['Spotify Player', 'YouTube Videos', 'Event Calendar', 'Merch Shop'],
  },
  {
    id: 'entrepreneur',
    name: 'Marcus Johnson',
    role: 'Tech Entrepreneur',
    icon: Briefcase,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
    description: 'Blog posts, product launches, newsletter signup, and media kit.',
    tags: ['Business', 'Startup', 'Professional'],
    features: ['Blog Integration', 'Newsletter Form', 'Product Showcase', 'Media Kit'],
  },
  {
    id: 'developer',
    name: 'Luna Park',
    role: 'Full-Stack Developer',
    icon: Code,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
    description: 'GitHub repos, project demos, tech blog, and code snippets.',
    tags: ['Tech', 'Developer', 'Open Source'],
    features: ['GitHub Stats', 'Project Links', 'Tech Blog', 'Code Snippets'],
  },
  {
    id: 'influencer',
    name: 'Mia Rodriguez',
    role: 'Lifestyle Influencer',
    icon: Heart,
    color: 'from-rose-500 to-red-500',
    bgColor: 'bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20',
    description: 'Instagram feed, TikTok videos, brand partnerships, and affiliate links.',
    tags: ['Social Media', 'Lifestyle', 'Influencer'],
    features: ['Instagram Embed', 'TikTok Videos', 'Affiliate Links', 'Brand Deals'],
  },
  {
    id: 'photographer',
    name: 'James Walker',
    role: 'Travel Photographer',
    icon: Camera,
    color: 'from-indigo-500 to-violet-500',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20',
    description: 'Photo portfolio, print shop, booking calendar, and location map.',
    tags: ['Photography', 'Travel', 'Creative'],
    features: ['Photo Gallery', 'Print Store', 'Booking System', 'World Map'],
  },
  {
    id: 'gamer',
    name: 'Tyler "Apex" Kim',
    role: 'Content Creator',
    icon: Gamepad2,
    color: 'from-yellow-500 to-lime-500',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-lime-50 dark:from-yellow-950/20 dark:to-lime-950/20',
    description: 'Twitch live stream, YouTube highlights, Discord server, and sponsorships.',
    tags: ['Gaming', 'Streaming', 'Content'],
    features: ['Twitch Embed', 'YouTube Channel', 'Discord Widget', 'Sponsor Links'],
  },
  {
    id: 'educator',
    name: 'Dr. Emma Walsh',
    role: 'Online Educator',
    icon: GraduationCap,
    color: 'from-teal-500 to-blue-500',
    bgColor: 'bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-950/20 dark:to-blue-950/20',
    description: 'Course catalog, free resources, student testimonials, and FAQ.',
    tags: ['Education', 'Courses', 'Teaching'],
    features: ['Course Listings', 'Free Downloads', 'Student Reviews', 'FAQ Section'],
  },
  {
    id: 'restaurant',
    name: 'The Cozy Café',
    role: 'Local Coffee Shop',
    icon: Coffee,
    color: 'from-brown-500 to-orange-700',
    bgColor: 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/20 dark:to-orange-950/20',
    description: 'Menu, location map, opening hours, online ordering, and reviews.',
    tags: ['Business', 'Food', 'Local'],
    features: ['Digital Menu', 'Google Maps', 'Online Orders', 'Customer Reviews'],
  },
];

export default function DemoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b sticky top-0 z-40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-primary">Linkbase*</Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
            <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="/changelog" className="text-muted-foreground hover:text-foreground transition-colors">Changelog</Link>
            <Link href="/demo" className="text-foreground font-semibold">Demo</Link>
          </nav>
          <Link href="/login">
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs px-3 py-1">
              Get Started Free
            </Badge>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero */}
        <div className="mb-16 text-center">
          <Badge className="mb-4 rounded-full px-4 py-1.5 bg-primary/10 text-primary border-primary/20 text-sm">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Demo Profiles
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter mb-4">
            See Linkbase in Action
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore example profiles showcasing different industries, styles, and use cases.
            Get inspired for your own link-in-bio page.
          </p>
        </div>

        {/* Demo Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {DEMO_PROFILES.map((profile) => {
            const IconComponent = profile.icon;
            return (
              <div
                key={profile.id}
                className="group rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Header with gradient */}
                <div className={`h-24 ${profile.bgColor} flex items-center justify-center relative overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${profile.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                  <div className={`relative p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-white/20`}>
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold mb-1">{profile.name}</h3>
                    <p className="text-sm text-muted-foreground">{profile.role}</p>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {profile.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Features list */}
                  <div className="mb-4 space-y-1.5">
                    {profile.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* CTA - Note: These are demo profiles, not real links */}
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    disabled
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Demo Profile
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Use Cases Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Perfect for Every Use Case
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you're a creator, entrepreneur, professional, or business — Linkbase adapts to your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Creators & Artists',
                description: 'Share your work, embed content from YouTube, Spotify, Instagram, and more.',
                icon: Palette,
              },
              {
                title: 'Businesses & Brands',
                description: 'Product showcases, booking links, customer reviews, and contact forms.',
                icon: Briefcase,
              },
              {
                title: 'Professionals',
                description: 'Portfolio, resume, blog, project links, and professional network.',
                icon: Linkedin,
              },
              {
                title: 'Influencers',
                description: 'Social media embeds, affiliate links, brand partnerships, and analytics.',
                icon: Instagram,
              },
            ].map((useCase) => {
              const UseCaseIcon = useCase.icon;
              return (
                <div
                  key={useCase.title}
                  className="rounded-2xl border bg-card p-6 flex gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="p-3 bg-primary/10 rounded-xl h-fit">
                    <UseCaseIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{useCase.title}</h3>
                    <p className="text-sm text-muted-foreground">{useCase.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border bg-primary text-primary-foreground p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to create your profile?</h3>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of creators, businesses, and professionals using Linkbase.
            Start building your digital presence today — for free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="secondary" className="rounded-full px-8">
                Create Your Free Page
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="rounded-full px-8 bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-8 flex flex-wrap gap-4 sm:gap-6 text-sm text-muted-foreground justify-between items-center">
          <Link href="/" className="font-bold text-foreground">Linkbase*</Link>
          <nav className="flex flex-wrap gap-4 sm:gap-6">
            <Link href="/features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/changelog" className="hover:text-foreground transition-colors">Changelog</Link>
            <Link href="/design" className="hover:text-foreground transition-colors">Design</Link>
            <Link href="/demo" className="hover:text-foreground transition-colors font-medium text-foreground">Demo</Link>
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
