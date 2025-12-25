import { ThreatAnalyzer } from '../../threatModeling';
describe('ThreatAnalyzer', () => {
  let analyzer: ThreatAnalyzer;
  beforeEach(() => { analyzer = new ThreatAnalyzer(); });
  it('should analyze threats', () => {
    analyzer.addThreat({ id: 't1', name: 'SQL Injection', category: 'database', severity: 'high', mitigations: ['Use parameterized queries'] });
    const threats = analyzer.analyze({ components: ['database', 'api'], dataFlows: [] });
    expect(threats.length).toBe(1);
    expect(analyzer.getMitigations('t1')).toContain('Use parameterized queries');
  });
});
