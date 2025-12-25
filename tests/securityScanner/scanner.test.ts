import { SecurityScanner } from '../../securityScanner';

describe('SecurityScanner', () => {
  let scanner: SecurityScanner;
  beforeEach(() => { scanner = new SecurityScanner(); });

  it('should scan for vulnerabilities', async () => {
    const results = await scanner.scan({ target: 'http://localhost:3000' });
    expect(results).toHaveProperty('vulnerabilities');
  });

  it('should categorize findings by severity', async () => {
    const results = await scanner.scan({ target: 'http://localhost:3000' });
    expect(results).toHaveProperty('critical');
    expect(results).toHaveProperty('high');
    expect(results).toHaveProperty('medium');
  });
});
