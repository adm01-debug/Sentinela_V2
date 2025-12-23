export const formatNumber = (value: number, decimals = 0) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
export const formatDecimal = (value: number, decimals = 2) => formatNumber(value, decimals);
export const formatCompact = (value: number) => new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' }).format(value);
export const formatOrdinal = (value: number) => value + 'º';
