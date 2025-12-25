import { DLPScanner } from '../../dlp';

describe('DLPScanner', () => {
  let scanner: DLPScanner;
  beforeEach(() => { scanner = new DLPScanner(); });

  it('should detect PII', async () => {
    const result = await scanner.scan('My SSN is 123-45-6789');
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.findings[0].type).toBe('SSN');
  });

  it('should detect credit cards', async () => {
    const result = await scanner.scan('Card: 4111111111111111');
    expect(result.findings.some(f => f.type === 'CREDIT_CARD')).toBe(true);
  });

  it('should redact sensitive data', async () => {
    const redacted = await scanner.redact('Email: test@example.com');
    expect(redacted).not.toContain('test@example.com');
  });
});
