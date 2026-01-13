export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
export const round = (n: number, decimals = 2) => Math.round(n * 10 ** decimals) / 10 ** decimals;
export const percent = (value: number, total: number) => total === 0 ? 0 : round((value / total) * 100);
export const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
