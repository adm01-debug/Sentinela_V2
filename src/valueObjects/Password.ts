export class Password {
  private readonly value: string;
  private static readonly MIN_LENGTH = 8;
  constructor(password: string) { if (!Password.isValid(password)) throw new Error('Password must be at least 8 chars with uppercase, lowercase, number'); this.value = password; }
  static isValid(password: string): boolean { return password.length >= Password.MIN_LENGTH && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password); }
  getValue(): string { return this.value; }
  static getRequirements(): string[] { return ['At least 8 characters', 'One uppercase letter', 'One lowercase letter', 'One number']; }
}
