export class Email {
  private readonly value: string;
  constructor(email: string) { if (!Email.isValid(email)) throw new Error('Invalid email'); this.value = email.toLowerCase(); }
  static isValid(email: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
  getValue(): string { return this.value; }
  getDomain(): string { return this.value.split('@')[1]; }
  equals(other: Email): boolean { return this.value === other.value; }
  toString(): string { return this.value; }
}
