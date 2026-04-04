// Mask utilities for Sentinela v17

export function applyMask(value: string, mask: string): string {
  let result = '';
  let valueIndex = 0;
  const cleanValue = value.replace(/\D/g, '');

  for (let i = 0; i < mask.length && valueIndex < cleanValue.length; i++) {
    if (mask[i] === '9') {
      result += cleanValue[valueIndex];
      valueIndex++;
    } else {
      result += mask[i];
    }
  }

  return result;
}

export function removeMask(value): string {
  return value.replace(/\D/g, '');
}

export function maskCPF(value): string {
  return applyMask(value, '999.999.999-99');
}

export function maskCNPJ(value): string {
  return applyMask(value, '99.999.999/9999-99');
}

export function maskCPFCNPJ(value): string {
  const digits = removeMask(value);
  return digits.length <= 11 ? maskCPF(value) : maskCNPJ(value);
}

export function maskPhone(value): string {
  const digits = removeMask(value);
  if (digits.length <= 10) {
    return applyMask(value, '(99) 9999-9999');
  }
  return applyMask(value, '(99) 99999-9999');
}

export function maskCEP(value): string {
  return applyMask(value, '99999-999');
}

export function maskDate(value): string {
  return applyMask(value, '99/99/9999');
}

export function maskTime(value): string {
  return applyMask(value, '99:99');
}

export function maskDateTime(value): string {
  return applyMask(value, '99/99/9999 99:99');
}

export function maskCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(removeMask(value)) / 100 : value;
  return numValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function maskCreditCard(value): string {
  return applyMask(value, '9999 9999 9999 9999');
}

export function maskCreditCardExpiry(value): string {
  return applyMask(value, '99/99');
}

export function maskCVV(value): string {
  return applyMask(value, '999');
}

export function maskPercentage(value): string {
  const num = parseFloat(removeMask(value));
  if (isNaN(num)) return '';
  return `${Math.min(100, Math.max(0, num))}%`;
}

export function maskUpperCase(value): string {
  return value.toUpperCase();
}

export function maskLowerCase(value): string {
  return value.toLowerCase();
}

export function maskCapitalize(value): string {
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function maskEmail(value): string {
  return value.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
}

export function maskAlphanumeric(value): string {
  return value.replace(/[^a-zA-Z0-9]/g, '');
}

export function maskNumeric(value): string {
  return value.replace(/\D/g, '');
}

export function maskDecimal(value: string, decimals = 2): string {
  const num = parseFloat(value.replace(',', '.'));
  if (isNaN(num)) return '';
  return num.toFixed(decimals).replace('.', ',');
}

export function createCustomMask(pattern): (value) => string {
  return (value) => applyMask(value, pattern);
}

// Validation helpers
export function isValidCPF(cpf): boolean {
  const digits = removeMask(cpf);
  if (digits.length !== 11 || /^(\d)+$/.test(digits)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let check = (sum * 10) % 11;
  if (check === 10 || check === 11) check = 0;
  if (check !== parseInt(digits[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  check = (sum * 10) % 11;
  if (check === 10 || check === 11) check = 0;
  return check === parseInt(digits[10]);
}

export function isValidCNPJ(cnpj): boolean {
  const digits = removeMask(cnpj);
  if (digits.length !== 14 || /^(\d)+$/.test(digits)) return false;
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(digits[i]) * weights1[i];
  let check = sum % 11;
  check = check < 2 ? 0 : 11 - check;
  if (check !== parseInt(digits[12])) return false;
  
  sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(digits[i]) * weights2[i];
  check = sum % 11;
  check = check < 2 ? 0 : 11 - check;
  return check === parseInt(digits[13]);
}
