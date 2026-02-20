export type Link = {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  thumbnailHint: string;
  orderIndex: number;
  pageId: string;
  colSpan?: number;
  rowSpan?: number;
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
