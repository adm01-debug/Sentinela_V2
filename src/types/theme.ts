export interface Theme {
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  spacing: ThemeSpacing;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  muted: string;
  accent: string;
  destructive: string;
}

export interface ThemeFonts {
  sans: string;
  mono: string;
}

export interface ThemeSpacing {
  unit: number;
}