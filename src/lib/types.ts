export type Link = {
  id: string;
  pageId: string;
  orderIndex: number;
  title: string;
  type: 'link' | 'text' | 'spotify' | 'youtube' | 'article' | 'blog-overview' | 'image' | 'product';
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
};

export type Page = {
  id: string; // Same as user.uid
  ownerId: string;
  slug: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  avatarHint: string;
  // Appearance settings can be part of the profile
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
};

export type Post = {
  id: string;
  pageId: string;
  ownerId: string;
  title: string;
  content: string;
  slug: string;
  status: 'draft' | 'published';
  category?: string;
  createdAt: any;
  updatedAt: any;
};

export type SlugLookup = {
  pageId: string;
};

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
