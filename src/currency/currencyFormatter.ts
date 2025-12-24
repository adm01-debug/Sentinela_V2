export class CurrencyFormatter {
  format(value: number, currency = 'BRL', locale = 'pt-BR'): string { return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value); }
  parse(value: string): number { return parseFloat(value.replace(/[^0-9,-]/g, '').replace(',', '.')); }
  formatCompact(value: number, currency = 'BRL', locale = 'pt-BR'): string { return new Intl.NumberFormat(locale, { style: 'currency', currency, notation: 'compact' }).format(value); }
}
export const currencyFormatter = new CurrencyFormatter();
