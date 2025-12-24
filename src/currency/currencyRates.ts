export interface ExchangeRate { from: string; to: string; rate: number; updatedAt: Date; }
export class CurrencyRates {
  private rates: ExchangeRate[] = [];
  async fetchRates(base = 'BRL'): Promise<ExchangeRate[]> { this.rates = [ { from: 'BRL', to: 'USD', rate: 0.20, updatedAt: new Date() }, { from: 'BRL', to: 'EUR', rate: 0.18, updatedAt: new Date() }, { from: 'USD', to: 'BRL', rate: 5.0, updatedAt: new Date() }, { from: 'EUR', to: 'BRL', rate: 5.5, updatedAt: new Date() } ]; return this.rates; }
  getRate(from: string, to: string): ExchangeRate | undefined { return this.rates.find(r => r.from === from && r.to === to); }
  getAllRates(): ExchangeRate[] { return [...this.rates]; }
}
export const currencyRates = new CurrencyRates();
