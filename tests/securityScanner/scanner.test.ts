import { SecurityScanner, VulnerabilityReport, Severity } from '../../securityScanner';
describe('SecurityScanner', () => {
  let scanner: SecurityScanner;
  beforeEach(() => { scanner = new SecurityScanner(); });
  it('should scan dependencies', async () => {
    const report = await scanner.scanDependencies('./package.json');
    expect(report.vulnerabilities).toBeDefined();
  });
  it('should scan code', async () => {
    const report = await scanner.scanCode('./src');
    expect(report.issues).toBeDefined();
  });
  it('should filter by severity', async () => {
    const report = await scanner.scanDependencies('./package.json');
    const critical = report.filterBySeverity('critical');
    expect(critical.every(v => v.severity === 'critical')).toBe(true);
  });
  it('should generate SBOM', async () => {
    const sbom = await scanner.generateSBOM();
    expect(sbom.components).toBeDefined();
  });
});