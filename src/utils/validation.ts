export const isEmail = (value): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const isCPF = (cpf): boolean => {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11 || /^(\d)\1+$/.test(clean)) return false;
  let sum = 0, rest;
  for (let i = 1; i <= 9; i++) sum += parseInt(clean[i - 1]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(clean[9])) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(clean[i - 1]) * (12 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  return rest === parseInt(clean[10]);
};
export const isCNPJ = (cnpj): boolean => {
  const clean = cnpj.replace(/\D/g, '');
  return clean.length === 14 && !/^(\d)\1+$/.test(clean);
};
export const isPhone = (phone): boolean => /^\+?[\d\s()-]{10,}$/.test(phone);
export const isURL = (url): boolean => { try { new URL(url); return true; } catch { return false; } };
export const isStrongPassword = (pwd): boolean => pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd);
