export const typography = {
  fontFamily: { sans: 'Inter, system-ui, sans-serif', mono: 'JetBrains Mono, monospace' },
  fontSize: { xs: ['0.75rem', { lineHeight: '1rem' }], sm: ['0.875rem', { lineHeight: '1.25rem' }], base: ['1rem', { lineHeight: '1.5rem' }], lg: ['1.125rem', { lineHeight: '1.75rem' }], xl: ['1.25rem', { lineHeight: '1.75rem' }], '2xl': ['1.5rem', { lineHeight: '2rem' }], '3xl': ['1.875rem', { lineHeight: '2.25rem' }], '4xl': ['2.25rem', { lineHeight: '2.5rem' }] },
  fontWeight: { light: '300', normal: '400', medium: '500', semibold: '600', bold: '700' },
  letterSpacing: { tighter: '-0.05em', tight: '-0.025em', normal: '0', wide: '0.025em', wider: '0.05em' },
};

export const textStyles = {
  h1: { fontSize: '2.25rem', fontWeight: '700', lineHeight: '2.5rem', letterSpacing: '-0.025em' },
  h2: { fontSize: '1.875rem', fontWeight: '600', lineHeight: '2.25rem' },
  h3: { fontSize: '1.5rem', fontWeight: '600', lineHeight: '2rem' },
  h4: { fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.75rem' },
  body: { fontSize: '1rem', fontWeight: '400', lineHeight: '1.5rem' },
  small: { fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.25rem' },
  caption: { fontSize: '0.75rem', fontWeight: '400', lineHeight: '1rem' },
};
