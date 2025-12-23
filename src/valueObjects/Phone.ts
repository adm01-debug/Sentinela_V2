export class Phone {
  private readonly value: string;
  constructor(phone: string) { const clean = phone.replace(/\D/g, ''); if (!Phone.isValid(clean)) throw new Error('Invalid phone'); this.value = clean; }
  static isValid(phone: string): boolean { const clean = phone.replace(/\D/g, ''); return clean.length >= 10 && clean.length <= 11; }
  getValue(): string { return this.value; }
  getFormatted(): string { if (this.value.length === 11) return this.value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'); return this.value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3'); }
  isMobile(): boolean { return this.value.length === 11 && this.value[2] === '9'; }
}
