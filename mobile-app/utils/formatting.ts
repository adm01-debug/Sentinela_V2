export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const truncate = (s: string, n: number) => s.length > n ? s.slice(0, n) + '...' : s;