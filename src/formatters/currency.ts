export const formatCurrency = (value: number, currency = 'BRL') => new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
export const formatBRL = (value: number) => formatCurrency(value, 'BRL');
export const formatUSD = (value: number) => formatCurrency(value, 'USD');
export const parseCurrency = (value: string) => Number(value.replace(/[^0-9,-]/g, '').replace(',', '.'));
