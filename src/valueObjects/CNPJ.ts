export class CNPJ {
  private readonly value: string;
  constructor(cnpj: string) { const clean = cnpj.replace(/\D/g, ''); if (!CNPJ.isValid(clean)) throw new Error('Invalid CNPJ'); this.value = clean; }
  static isValid(cnpj: string): boolean { const clean = cnpj.replace(/\D/g, ''); if (clean.length !== 14 || /^(\d)\1+$/.test(clean)) return false; const weights1 = [5,4,3,2,9,8,7,6,5,4,3,2]; const weights2 = [6,5,4,3,2,9,8,7,6,5,4,3,2]; let sum = 0; for (let i = 0; i < 12; i++) sum += parseInt(clean[i]) * weights1[i]; let d1 = sum % 11 < 2 ? 0 : 11 - (sum % 11); if (d1 !== parseInt(clean[12])) return false; sum = 0; for (let i = 0; i < 13; i++) sum += parseInt(clean[i]) * weights2[i]; let d2 = sum % 11 < 2 ? 0 : 11 - (sum % 11); return d2 === parseInt(clean[13]); }
  getValue(): string { return this.value; }
  getFormatted(): string { return this.value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'); }
}
