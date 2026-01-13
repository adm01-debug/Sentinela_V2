export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isPhone = (v: string) => /^\+?[\d\s-()]{10,}$/.test(v);
export const isCPF = (v: string) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v);
export const isCNPJ = (v: string) => /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(v);
export const isURL = (v: string) => { try { new URL(v); return true; } catch { return false; } };
