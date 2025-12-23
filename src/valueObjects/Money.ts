export class Money {
  private readonly cents: number;
  private readonly currency: string;
  constructor(amount: number, currency = 'BRL') { this.cents = Math.round(amount * 100); this.currency = currency; }
  static fromCents(cents: number, currency = 'BRL'): Money { const m = new Money(0, currency); (m as any).cents = cents; return m; }
  getAmount(): number { return this.cents / 100; }
  getCents(): number { return this.cents; }
  add(other: Money): Money { return Money.fromCents(this.cents + other.cents, this.currency); }
  subtract(other: Money): Money { return Money.fromCents(this.cents - other.cents, this.currency); }
  multiply(factor: number): Money { return Money.fromCents(Math.round(this.cents * factor), this.currency); }
  format(): string { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: this.currency }).format(this.getAmount()); }
}
