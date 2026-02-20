export type Link = {
  id: string;
  pageId: string;
  orderIndex: number;
  title: string;
  type: 'link' | 'text' | 'spotify' | 'youtube';
  colSpan?: number;
  rowSpan?: number;
  content?: string; // For text cards
  url?: string; // For link-based cards
  thumbnailUrl?: string;
  thumbnailHint?: string;
  hasTransparentBackground?: boolean;
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
  foregroundColor?: string;
  cardColor?: string;
  cardForegroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
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
  borderRadius?: number; // in rem
  borderWidth?: number; // in px
  borderColor?: string;
};
