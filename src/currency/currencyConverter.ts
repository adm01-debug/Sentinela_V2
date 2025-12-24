export class CurrencyConverter {
  private rates = new Map<string, number>();
  setRate(from: string, to: string, rate: number): void { this.rates.set(from + '_' + to, rate); this.rates.set(to + '_' + from, 1 / rate); }
  convert(amount: number, from: string, to: string): number { if (from === to) return amount; const rate = this.rates.get(from + '_' + to); if (!rate) throw new Error('Rate not found'); return amount * rate; }
  getRate(from: string, to: string): number | undefined { return this.rates.get(from + '_' + to); }
}
export const currencyConverter = new CurrencyConverter();
