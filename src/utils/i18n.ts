// Internationalization utilities for Sentinela v17

type TranslationKey = string;
type TranslationValues = Record<string, string | number>;
type Translations = Record<string, string | Record<string, unknown>>;

export class I18n {
  private locale: string;
  private translations: Map<string, Translations> = new Map();
  private fallbackLocale: string = 'pt-BR';

  constructor(locale: string = 'pt-BR') {
    this.locale = locale;
  }

  setLocale(locale: string): void {
    this.locale = locale;
  }

  getLocale(): string {
    return this.locale;
  }

  setFallbackLocale(locale: string): void {
    this.fallbackLocale = locale;
  }

  addTranslations(locale: string, translations: Translations): void {
    const existing = this.translations.get(locale) || {};
    this.translations.set(locale, { ...existing, ...translations });
  }

  t(key: TranslationKey, values?: TranslationValues): string {
    const translation = this.getTranslation(key, this.locale) 
      || this.getTranslation(key, this.fallbackLocale) 
      || key;

    if (values) {
      return this.interpolate(translation, values);
    }
    return translation;
  }

  private getTranslation(key: string, locale: string): string | null {
    const translations = this.translations.get(locale);
    if (!translations) return null;

    const keys = key.split('.');
    let value: unknown = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return null;
      }
    }

    return typeof value === 'string' ? value : null;
  }

  private interpolate(template: string, values: TranslationValues): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(values[key] ?? `{{${key}}}`));
  }

  n(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, options).format(value);
  }

  d(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.locale, options).format(new Date(date));
  }

  c(value: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat(this.locale, { style: 'currency', currency }).format(value);
  }

  p(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, { style: 'percent', ...options }).format(value);
  }

  pluralize(count: number, singular: string, plural: string): string {
    return count === 1 ? singular : plural;
  }

  relativeTime(date: Date | string | number, style: 'long' | 'short' | 'narrow' = 'long'): string {
    const rtf = new Intl.RelativeTimeFormat(this.locale, { style });
    const diff = new Date(date).getTime() - Date.now();
    const seconds = Math.round(diff / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const months = Math.round(days / 30);
    const years = Math.round(days / 365);

    if (Math.abs(years) >= 1) return rtf.format(years, 'year');
    if (Math.abs(months) >= 1) return rtf.format(months, 'month');
    if (Math.abs(days) >= 1) return rtf.format(days, 'day');
    if (Math.abs(hours) >= 1) return rtf.format(hours, 'hour');
    if (Math.abs(minutes) >= 1) return rtf.format(minutes, 'minute');
    return rtf.format(seconds, 'second');
  }

  list(items: string[], type: 'conjunction' | 'disjunction' = 'conjunction'): string {
    return new Intl.ListFormat(this.locale, { type }).format(items);
  }
}

export const i18n = new I18n();

// Convenience exports
export const t = i18n.t.bind(i18n);
export const n = i18n.n.bind(i18n);
export const d = i18n.d.bind(i18n);
export const c = i18n.c.bind(i18n);

// Default PT-BR translations
i18n.addTranslations('pt-BR', {
  common: {
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    create: 'Criar',
    search: 'Buscar',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    confirm: 'Confirmar',
    yes: 'Sim',
    no: 'Não',
  },
  validation: {
    required: 'Campo obrigatório',
    email: 'Email inválido',
    minLength: 'Mínimo de {{min}} caracteres',
    maxLength: 'Máximo de {{max}} caracteres',
  },
});
