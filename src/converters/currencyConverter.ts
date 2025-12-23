export const currencyConverter = {
  BRLtoUSD: (brl: number, rate = 0.20): number => brl * rate,
  USDtoBRL: (usd: number, rate = 5.0): number => usd * rate,
  format: (value: number, currency = 'BRL'): string => new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value),
  parse: (str: string): number => parseFloat(str.replace(/[^\d,-]/g, '').replace(',', '.')),
  centsToCurrency: (cents: number): number => cents / 100,
  currencyToCents: (value: number): number => Math.round(value * 100),
};
