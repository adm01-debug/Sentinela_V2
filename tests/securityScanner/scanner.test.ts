import { SecurityScanner } from '../../securityScanner';
describe('SecurityScanner', () => {
  it('should scan target', async () => {
    const scanner = new SecurityScanner();
    const result = await scanner.scan({ target: 'http://test.local', depth: 2 });
    expect(result.target).toBe('http://test.local');
    expect(result.scannedAt).toBeDefined();
  });
});
