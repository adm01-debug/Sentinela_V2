export const numberTransformer = {
  toNumber: (value: string | number): number => typeof value === 'string' ? parseFloat(value) : value,
  toString: (value: number): string => String(value),
  toInt: (value: string | number): number => typeof value === 'string' ? parseInt(value, 10) : Math.floor(value),
  toFixed: (value: number, decimals = 2): string => value.toFixed(decimals),
  toPercentage: (value: number, total: number): number => total === 0 ? 0 : (value / total) * 100,
  clamp: (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max),
};
