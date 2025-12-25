import { DLPScanner, SensitiveDataType, ScanResult } from '../../dlp';

describe('DLPScanner', () => {
  let scanner: DLPScanner;

  beforeEach(() => {
    scanner = new DLPScanner({
      patterns: [
        { type: 'CREDIT_CARD', regex: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/ },
        { type: 'SSN', regex: /\b\d{3}-\d{2}-\d{4}\b/ },
        { type: 'EMAIL', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ }
      ]
    });
  });

  it('should detect credit card numbers', () => {
    const text = 'My card is 4111-1111-1111-1111';
    const result = scanner.scan(text);

    expect(result.findings.length).toBe(1);
    expect(result.findings[0].type).toBe('CREDIT_CARD');
  });

  it('should detect SSN', () => {
    const text = 'SSN: 123-45-6789';
    const result = scanner.scan(text);

    expect(result.findings.length).toBe(1);
    expect(result.findings[0].type).toBe('SSN');
  });

  it('should detect multiple patterns', () => {
    const text = 'Card: 4111-1111-1111-1111, Email: test@example.com';
    const result = scanner.scan(text);

    expect(result.findings.length).toBe(2);
  });

  it('should redact sensitive data', () => {
    const text = 'Card: 4111-1111-1111-1111';
    const redacted = scanner.redact(text);

    expect(redacted).toContain('[REDACTED]');
    expect(redacted).not.toContain('4111');
  });
});
