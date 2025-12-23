export const formatPercentage = (value: number, decimals = 0) => new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value / 100);
export const formatPercentageChange = (value: number) => (value >= 0 ? '+' : '') + formatPercentage(value);
