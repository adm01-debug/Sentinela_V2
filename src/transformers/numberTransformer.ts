export const numberTransformer = {
  toInt: (value: string | number): number => typeof value === 'string' ? parseInt(value, 10) : Math.floor(value),
  toFloat: (value: string | number, decimals = 2): number => parseFloat(Number(value).toFixed(decimals)),
  toPercentage: (value: number, total: number): number => total === 0 ? 0 : (value / total) * 100,
  toCurrency: (value: number): string => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
  fromCurrency: (value: string): number => parseFloat(value.replace(/[^0-9,-]/g, '').replace(',', '.')),
  clamp: (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max),
};
