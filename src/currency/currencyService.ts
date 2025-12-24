import { currencyFormatter } from './currencyFormatter';
import { currencyConverter } from './currencyConverter';
import { currencyRates } from './currencyRates';
export class CurrencyService {
  async init(): Promise<void> { const rates = await currencyRates.fetchRates(); rates.forEach(r => currencyConverter.setRate(r.from, r.to, r.rate)); }
  format(value: number, currency?: string): string { return currencyFormatter.format(value, currency); }
  convert(amount: number, from: string, to: string): number { return currencyConverter.convert(amount, from, to); }
  formatConverted(amount: number, from: string, to: string): string { const converted = this.convert(amount, from, to); return this.format(converted, to); }
}
export const currencyService = new CurrencyService();
