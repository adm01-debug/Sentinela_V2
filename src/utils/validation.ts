export const isEmail = (value): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const isCPF = (cpf): boolean => {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11 || /^(\d)\1+$/.test(clean)) return false;
  let sum = 0,
    rest;
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
  const clean = cnpj.replace(/\D/g, "");
  if (clean.length !== 14 || /^(\d)\1+$/.test(clean)) return false;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(clean[i]) * weights1[i];
  let d1 = 11 - (sum % 11);
  if (d1 > 9) d1 = 0;
  if (parseInt(clean[12]) !== d1) return false;
  sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(clean[i]) * weights2[i];
  let d2 = 11 - (sum % 11);
  if (d2 > 9) d2 = 0;
  return parseInt(clean[13]) === d2;
};
export const isPhone = (phone): boolean => /^\+?[\d\s()-]{10,}$/.test(phone);
export const isURL = (url): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
export const isStrongPassword = (pwd): boolean =>
  pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd);
