export const defaultLocale = 'en';
export const supportedLocales = ['en', 'pt', 'es'] as const;
export type Locale = typeof supportedLocales[number];
export const localeNames: Record<Locale, string> = { en: 'English', pt: 'Português', es: 'Español' };
export const dateFormats: Record<Locale, string> = { en: 'MM/dd/yyyy', pt: 'dd/MM/yyyy', es: 'dd/MM/yyyy' };
export const numberFormats: Record<Locale, Intl.NumberFormatOptions> = {
  en: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 },
  pt: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 },
  es: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 },
};
export const currencyFormats: Record<Locale, { currency: string; locale: string }> = {
  en: { currency: 'USD', locale: 'en-US' },
  pt: { currency: 'BRL', locale: 'pt-BR' },
  es: { currency: 'EUR', locale: 'es-ES' },
};
