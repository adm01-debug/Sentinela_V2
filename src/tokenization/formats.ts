export class TokenFormats {
  static creditCard(last4: string): string { return 'XXXX-XXXX-XXXX-' + last4; }
  static ssn(last4: string): string { return 'XXX-XX-' + last4; }
  static phone(areaCode: string): string { return '(' + areaCode + ') XXX-XXXX'; }
  static email(domain: string): string { return 'xxxxx@' + domain; }
}

export class FormatValidator {
  static isCreditCard(value: string): boolean { return /^\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}$/.test(value); }
  static isSSN(value: string): boolean { return /^\d{3}-\d{2}-\d{4}$/.test(value); }
  static isEmail(value: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
  static isPhone(value: string): boolean { return /^\+?[\d\s()-]{10,}$/.test(value); }
}

export class FormatPreserver {
  preserve(original: string, tokenized: string): string {
    let result = '';
    let tokenIndex = 0;
    for (const char of original) {
      if (/[a-zA-Z0-9]/.test(char)) {
        result += tokenized[tokenIndex++] ?? char;
      } else {
        result += char;
      }
    }
    return result;
  }
}