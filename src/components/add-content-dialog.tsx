'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Link as LinkIcon, Music, Youtube, BookText, Newspaper, Rss,
  Image as ImageIcon, ShoppingBag, User as UserIcon, MapPin,
  Instagram, Video, Music2, Cloud, CalendarDays, Github,
  Clock, Timer, Twitter, Tv, Heart, Mail, Smartphone, Headphones,
  Pin, MessageCircle, Quote, HelpCircle, Minus, Play, QrCode,
} from 'lucide-react';
import { LinkEditor, linkSchema } from './link-editor';
import { TextEditor, textSchema } from './text-editor';
import { ArticleEditor, articleSchema } from './article-editor';
import { BlogOverviewEditor, blogOverviewSchema } from './blog-overview-editor';
import { ProductEditor, productSchema } from './product-editor';
import { ImageEditor, imageSchema } from './image-editor';
import { ProfileCardEditor, profileCardSchema } from './profile-card-editor';
import { MapEditor, mapSchema } from './map-editor';
import { ClockEditor, clockSchema } from './clock-editor';
import { CountdownEditor, countdownSchema } from './countdown-editor';
import { DonationEditor, donationSchema } from './donation-editor';
import { ContactInfoEditor, contactInfoSchema } from './contact-info-editor';
import { AudioEditor, audioSchema } from './audio-editor';
import { AppDownloadEditor, appDownloadSchema } from './appdownload-editor';
import { TestimonialEditor, testimonialSchema } from './testimonial-editor';
import { FaqEditor, faqSchema } from './faq-editor';
import { HeaderEditor, headerSchema } from './header-editor';
import { VideoEditor, videoSchema } from './video-editor';
import { QrCodeEditor, qrcodeSchema } from './qrcode-editor';
import type { z } from 'zod';
import type { Link } from '@/lib/types';

type ContentFormData = (
  | z.infer<typeof linkSchema>
  | z.infer<typeof textSchema>
  | z.infer<typeof articleSchema>
  | z.infer<typeof blogOverviewSchema>
  | z.infer<typeof productSchema>
  | z.infer<typeof imageSchema>
  | z.infer<typeof profileCardSchema>
  | z.infer<typeof mapSchema>
  | z.infer<typeof clockSchema>
  | z.infer<typeof countdownSchema>
  | z.infer<typeof donationSchema>
  | z.infer<typeof contactInfoSchema>
  | z.infer<typeof audioSchema>
  | z.infer<typeof appDownloadSchema>
  | z.infer<typeof testimonialSchema>
  | z.infer<typeof faqSchema>
  | z.infer<typeof headerSchema>
  | z.infer<typeof videoSchema>
  | z.infer<typeof qrcodeSchema>
) & { type: Link['type'] };

interface AddContentDialogProps {
  onSave: (data: ContentFormData) => void;
  onCancel: () => void;
  contentToEdit?: Link | null;
}

type ContentTypeButton = {
  type: Link['type'];
  label: string;
  description: string;
  icon: React.ElementType;
};

const CONTENT_SECTIONS: { label: string; items: ContentTypeButton[] }[] = [
  {
    label: 'Content',
    items: [
      { type: 'link', label: 'Standard Link', description: 'Link to any website', icon: LinkIcon },
      { type: 'text', label: 'Text Block', description: 'Title and text content', icon: BookText },
      { type: 'image', label: 'Image', description: 'Display a single image', icon: ImageIcon },
      { type: 'article', label: 'Article', description: 'Feature an article', icon: Newspaper },
      { type: 'product', label: 'Product', description: 'Feature a product', icon: ShoppingBag },
      { type: 'profile', label: 'Profile Card', description: 'Mention another user', icon: UserIcon },
    ],
  },
  {
    label: 'Widgets',
    items: [
      { type: 'map', label: 'Map', description: 'Embed a Google Map', icon: MapPin },
      { type: 'clock', label: 'Clock', description: 'Live world clock', icon: Clock },
      { type: 'countdown', label: 'Countdown', description: 'Count down to a date', icon: Timer },
      { type: 'blog-overview', label: 'Blog Overview', description: 'Display latest posts', icon: Rss },
    ],
  },
  {
    label: 'Video & Music',
    items: [
      { type: 'youtube', label: 'YouTube', description: 'Embed a YouTube video', icon: Youtube },
      { type: 'vimeo', label: 'Vimeo', description: 'Embed a Vimeo video', icon: Video },
      { type: 'tiktok', label: 'TikTok', description: 'Embed a TikTok video', icon: Music2 },
      { type: 'instagram', label: 'Instagram', description: 'Embed an Instagram post', icon: Instagram },
      { type: 'spotify', label: 'Spotify', description: 'Embed a Spotify track', icon: Music },
      { type: 'soundcloud', label: 'SoundCloud', description: 'Embed a SoundCloud track', icon: Cloud },
    ],
  },
  {
    label: 'Tools',
    items: [
      { type: 'calendly', label: 'Calendly', description: 'Embed a booking page', icon: CalendarDays },
      { type: 'github', label: 'GitHub', description: 'Show a GitHub repo', icon: Github },
      { type: 'twitter', label: 'Twitter / X', description: 'Embed a tweet or post', icon: Twitter },
      { type: 'twitch', label: 'Twitch', description: 'Embed a live stream', icon: Tv },
    ],
  },
  {
    label: 'More',
    items: [
      { type: 'header', label: 'Section Header', description: 'Divider with label', icon: Minus },
      { type: 'video', label: 'Video Player', description: 'Embed an MP4/WebM file', icon: Play },
      { type: 'qrcode', label: 'QR Code', description: 'Auto-generated QR card', icon: QrCode },
      { type: 'donation', label: 'Support / Donate', description: 'PayPal, Ko-fi, BMAC…', icon: Heart },
      { type: 'contact-info', label: 'Contact Info', description: 'Email & phone card', icon: Mail },
      { type: 'audio', label: 'Audio Player', description: 'Embed an audio file', icon: Headphones },
      { type: 'appdownload', label: 'App Download', description: 'App Store & Play Store', icon: Smartphone },
      { type: 'testimonial', label: 'Testimonial', description: 'Quote with star rating', icon: Quote },
      { type: 'faq', label: 'FAQ', description: 'Accordion Q&A list', icon: HelpCircle },
      { type: 'pinterest', label: 'Pinterest', description: 'Embed a Pinterest pin', icon: Pin },
      { type: 'discord', label: 'Discord', description: 'Discord server widget', icon: MessageCircle },
    ],
  },
];

export function AddContentDialog({ onSave, onCancel, contentToEdit }: AddContentDialogProps) {
  const [contentType, setContentType] = useState<Link['type'] | null>(contentToEdit?.type || null);

  const handleBack = () => setContentType(null);

  const handleSave = (
    data:
      | z.infer<typeof linkSchema>
      | z.infer<typeof textSchema>
      | z.infer<typeof articleSchema>
      | z.infer<typeof blogOverviewSchema>
      | z.infer<typeof productSchema>
      | z.infer<typeof imageSchema>
      | z.infer<typeof profileCardSchema>
      | z.infer<typeof mapSchema>
      | z.infer<typeof clockSchema>
      | z.infer<typeof countdownSchema>,
    type: Link['type']
  ) => {
    onSave({ ...data, type } as ContentFormData);
  };

  // Editing existing content
  if (contentType && contentToEdit) {
    if (contentToEdit.type === 'text') return <TextEditor onSave={(d) => handleSave(d, 'text')} onCancel={onCancel} content={contentToEdit} />;
    if (contentToEdit.type === 'article') return <ArticleEditor onSave={(d) => handleSave(d, 'article')} onCancel={onCancel} article={contentToEdit} />;
    if (contentToEdit.type === 'blog-overview') return <BlogOverviewEditor onSave={(d) => handleSave(d, 'blog-overview')} onCancel={onCancel} content={contentToEdit} />;
    if (contentToEdit.type === 'product') return <ProductEditor onSave={(d) => handleSave(d, 'product')} onCancel={onCancel} product={contentToEdit} />;
    if (contentToEdit.type === 'image') return <ImageEditor onSave={(d) => handleSave(d, 'image')} onCancel={onCancel} image={contentToEdit} />;
    if (contentToEdit.type === 'profile') return <ProfileCardEditor onSave={(d) => handleSave(d, 'profile')} onCancel={onCancel} content={contentToEdit} />;
    if (contentToEdit.type === 'map') return <MapEditor onSave={(d) => handleSave(d, 'map')} onCancel={onCancel} content={contentToEdit} />;
    if (contentToEdit.type === 'clock') return <ClockEditor onSave={(d) => handleSave(d, 'clock')} onCancel={onCancel} content={contentToEdit} />;
    if (contentToEdit.type === 'countdown') return <CountdownEditor onSave={(d) => handleSave(d, 'countdown')} onCancel={onCancel} content={contentToEdit} />;
    if (contentToEdit.type === 'donation') return <DonationEditor onSave={(d) => handleSave(d, 'donation')} onCancel={onCancel} content={contentToEdit} />;
    if (contentToEdit.type === 'contact-info') return <ContactInfoEditor onSave={(d) => handleSave(d, 'contact-info')} onCancel={onCancel} content={contentToEdit} />;
    if (contentToEdit.type === 'audio') return <AudioEditor onSave={(d) => handleSave(d, 'audio')} onCancel={onCancel} content={contentToEdit} />;
    if (contentToEdit.type === 'appdownload') return <AppDownloadEditor onSave={(d) => handleSave(d, 'appdownload')} onCancel={onCancel} content={contentToEdit} />;
    if (contentToEdit.type === 'testimonial') return <TestimonialEditor onSave={(d) => handleSave(d, 'testimonial')} onCancel={onCancel} content={contentToEdit} />;
    if (contentToEdit.type === 'faq') return <FaqEditor onSave={(d) => handleSave(d, 'faq')} onCancel={onCancel} content={contentToEdit} />;
    if (contentToEdit.type === 'header') return <HeaderEditor onSave={(d) => handleSave(d, 'header')} onCancel={onCancel} content={contentToEdit} />;
    if (contentToEdit.type === 'video') return <VideoEditor onSave={(d) => handleSave(d, 'video')} onCancel={onCancel} content={contentToEdit} />;
    if (contentToEdit.type === 'qrcode') return <QrCodeEditor onSave={(d) => handleSave(d, 'qrcode')} onCancel={onCancel} content={contentToEdit} />;
    return <LinkEditor onSave={(d) => handleSave(d, contentToEdit.type as any)} onCancel={onCancel} mode={contentToEdit.type as 'link' | 'spotify' | 'youtube' | 'instagram' | 'tiktok' | 'soundcloud' | 'vimeo' | 'calendly' | 'github' | 'twitter' | 'twitch' | 'pinterest' | 'discord'} link={contentToEdit} />;
  }

  // Adding new content
  if (contentType) {
    if (contentType === 'text') return <TextEditor onSave={(d) => handleSave(d, 'text')} onCancel={handleBack} />;
    if (contentType === 'article') return <ArticleEditor onSave={(d) => handleSave(d, 'article')} onCancel={handleBack} />;
    if (contentType === 'blog-overview') return <BlogOverviewEditor onSave={(d) => handleSave(d, 'blog-overview')} onCancel={handleBack} />;
    if (contentType === 'product') return <ProductEditor onSave={(d) => handleSave(d, 'product')} onCancel={handleBack} />;
    if (contentType === 'image') return <ImageEditor onSave={(d) => handleSave(d, 'image')} onCancel={handleBack} />;
    if (contentType === 'profile') return <ProfileCardEditor onSave={(d) => handleSave(d, 'profile')} onCancel={handleBack} />;
    if (contentType === 'map') return <MapEditor onSave={(d) => handleSave(d, 'map')} onCancel={handleBack} />;
    if (contentType === 'clock') return <ClockEditor onSave={(d) => handleSave(d, 'clock')} onCancel={handleBack} />;
    if (contentType === 'countdown') return <CountdownEditor onSave={(d) => handleSave(d, 'countdown')} onCancel={handleBack} />;
    if (contentType === 'donation') return <DonationEditor onSave={(d) => handleSave(d, 'donation')} onCancel={handleBack} />;
    if (contentType === 'contact-info') return <ContactInfoEditor onSave={(d) => handleSave(d, 'contact-info')} onCancel={handleBack} />;
    if (contentType === 'audio') return <AudioEditor onSave={(d) => handleSave(d, 'audio')} onCancel={handleBack} />;
    if (contentType === 'appdownload') return <AppDownloadEditor onSave={(d) => handleSave(d, 'appdownload')} onCancel={handleBack} />;
    if (contentType === 'testimonial') return <TestimonialEditor onSave={(d) => handleSave(d, 'testimonial')} onCancel={handleBack} />;
    if (contentType === 'faq') return <FaqEditor onSave={(d) => handleSave(d, 'faq')} onCancel={handleBack} />;
    if (contentType === 'header') return <HeaderEditor onSave={(d) => handleSave(d, 'header')} onCancel={handleBack} />;
    if (contentType === 'video') return <VideoEditor onSave={(d) => handleSave(d, 'video')} onCancel={handleBack} />;
    if (contentType === 'qrcode') return <QrCodeEditor onSave={(d) => handleSave(d, 'qrcode')} onCancel={handleBack} />;
    return (
      <LinkEditor
        onSave={(d) => handleSave(d, contentType)}
        onCancel={handleBack}
        mode={contentType as 'link' | 'spotify' | 'youtube' | 'instagram' | 'tiktok' | 'soundcloud' | 'vimeo' | 'calendly' | 'github' | 'twitter' | 'twitch' | 'pinterest' | 'discord'}
      />
    );
  }

  // Initial type selection view
  return (
    <div className="space-y-5 pt-2">
      {CONTENT_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{section.label}</p>
          <div className="grid grid-cols-2 gap-2">
            {section.items.map((item) => (
              <Button
                key={item.type}
                variant="outline"
                className="h-16 text-sm justify-start p-3 gap-2"
                onClick={() => setContentType(item.type)}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <p className="font-medium truncate">{item.label}</p>
                  <p className="text-xs font-normal text-muted-foreground truncate">{item.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-end pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

