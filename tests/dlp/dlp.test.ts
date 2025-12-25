import { DLPScanner } from '../../dlp';
describe('DLPScanner', () => {
  let scanner: DLPScanner;
  beforeEach(() => { scanner = new DLPScanner(); });
  it('should detect SSN', async () => {
    const result = await scanner.scan('SSN: 123-45-6789');
    expect(result.findings.some(f => f.type === 'SSN')).toBe(true);
  });
  it('should detect email', async () => {
    const result = await scanner.scan('Contact: test@example.com');
    expect(result.findings.some(f => f.type === 'EMAIL')).toBe(true);
  });
  it('should redact sensitive data', async () => {
    const redacted = await scanner.redact('Email: test@example.com');
    expect(redacted).toContain('[REDACTED]');
    expect(redacted).not.toContain('test@example.com');
  });
});
