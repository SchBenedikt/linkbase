export type SocialLink = {
  platform: string;
  url: string;
};

export type Link = {
  id: string;
  pageId: string;
  orderIndex: number;
  title: string;
  type: 'link' | 'text' | 'spotify' | 'youtube' | 'article' | 'blog-overview' | 'image' | 'product' | 'profile' | 'map' | 'instagram' | 'tiktok' | 'soundcloud' | 'vimeo' | 'clock' | 'countdown' | 'calendly' | 'github' | 'twitter' | 'twitch' | 'donation' | 'contact-info' | 'audio' | 'appdownload' | 'pinterest' | 'discord' | 'testimonial' | 'faq';
  colSpan?: number;
  rowSpan?: number;
  content?: string; // For text cards or product description
  url?: string; // For link-based cards
  thumbnailUrl?: string;
  thumbnailHint?: string;
  hasTransparentBackground?: boolean;
  // New fields for articles
  excerpt?: string;
  readingTime?: string;
  publicationDate?: string;
  // New field for blog overview
  showCreationDate?: boolean;
  showExcerpts?: boolean;
  price?: string; // For product cards
  mentionedUserId?: string; // For profile cards
  timezone?: string;        // For clock widget
  countdownTarget?: string; // For countdown widget
  // Scheduling
  scheduledStart?: string;  // ISO date string – link visible from this date
  scheduledEnd?: string;    // ISO date string – link visible until this date
  // Contact info card
  email?: string;
  phone?: string;
  // App download card
  appStoreUrl?: string;
  playStoreUrl?: string;
  // Audio card
  audioUrl?: string;
  // Donation card
  donationButtonText?: string;
};

export type UserProfile = {
  id: string; // Same as user.uid
  username?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  avatarHint?: string;
  openForWork?: boolean;
  categories?: string[];
  socialLinks?: SocialLink[];
  createdAt: any;
  updatedAt: any;
}

export type Page = {
  id: string;
  ownerId: string;
  slug: string;
  title: string;
  status: 'published' | 'draft';
  // Profile fields denormalized onto the page object
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  avatarHint?: string;
  openForWork?: boolean;
  categories?: string[];
  socialLinks?: SocialLink[];
  // Appearance settings
  backgroundImage?: string;
  backgroundColor?: string;
  primaryColor?: string;
  accentColor?: string;
  foregroundColor?: string; // Main text color
  cardColor?: string;
  cardForegroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  fontFamily?: string;
  sensitiveContent?: boolean; // Age/content gate on public page
  createdAt: any;
  updatedAt: any;
};

export type Post = {
  id: string;
  pageId: string;
  ownerId: string;
  title: string;
  content: string;
  slug: string;
  status: 'draft' | 'published';
  categories?: string[];
  coverImage?: string;
  excerpt?: string;
  readingTime?: string;
  createdAt: any;
  updatedAt: any;
  authorName?: string;
  authorAvatarUrl?: string;
  authorPageSlug?: string;
  authorBio?: string;
};

export type SlugLookup = {
  pageId: string;
};

export type UsernameLookup = {
  userId: string;
}

export type ColorPalette = {
  name: string;
  colors: string[];
};

export type AITheme = {
  themeName: string;
  themeDescription: string;
  colorPalettes: ColorPalette[];
};

export type AppearanceSettings = {
  backgroundImage?: string; // URL for image
  backgroundColor?: string; // Fallback or solid color
  primaryColor?: string;
  accentColor?: string;
  foregroundColor?: string; // Main text color
  cardColor?: string;
  cardForegroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  fontFamily?: string;
};

export type PageViewRecord = {
  pageId: string;
  date: string; // YYYY-MM-DD
  count: number;
};

export type LinkClickRecord = {
  linkId: string;
  pageId: string;
  date: string; // YYYY-MM-DD
  count: number;
};

export type ShortLink = {
  id: string;
  code: string;          // e.g. "abc123"
  originalUrl: string;
  title?: string;
  ownerId: string;
  clickCount: number;
  isActive?: boolean;    // default true when not set; false = link disabled
  createdAt: any;
  updatedAt: any;
};

export type ShortLinkPublic = {
  originalUrl: string;
  clickCount: number;
};
