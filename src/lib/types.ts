export type Link = {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  thumbnailHint: string;
};

export type Profile = {
  name: string;
  bio: string;
  avatarUrl: string;
  avatarHint: string;
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
