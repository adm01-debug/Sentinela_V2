export const colors = {
  // Brand colors
  brand: {
    primary: '#3b82f6',
    secondary: '#0ea5e9',
    accent: '#8b5cf6',
  },
  // Semantic colors
  semantic: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  // Background colors
  background: {
    default: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    inverse: '#0f172a',
  },
  // Text colors
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#94a3b8',
    inverse: '#ffffff',
    link: '#3b82f6',
  },
  // Border colors
  border: {
    default: '#e2e8f0',
    focus: '#3b82f6',
    error: '#ef4444',
  },
} as const;

export type Colors = typeof colors;
