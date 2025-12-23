export class CPF {
  private readonly value: string;
  constructor(cpf: string) { const clean = cpf.replace(/\D/g, ''); if (!CPF.isValid(clean)) throw new Error('Invalid CPF'); this.value = clean; }
  static isValid(cpf: string): boolean { const clean = cpf.replace(/\D/g, ''); if (clean.length !== 11 || /^(\d)\1+$/.test(clean)) return false; let sum = 0; for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i); let d1 = (sum * 10) % 11; if (d1 === 10) d1 = 0; if (d1 !== parseInt(clean[9])) return false; sum = 0; for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i); let d2 = (sum * 10) % 11; if (d2 === 10) d2 = 0; return d2 === parseInt(clean[10]); }
  getValue(): string { return this.value; }
  getFormatted(): string { return this.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'); }
}
