export const isEmail = (v: string) => /^[^@]+@[^@]+\.[^@]+$/.test(v);
export const isPhone = (v: string) => /^\d{10,11}$/.test(v);