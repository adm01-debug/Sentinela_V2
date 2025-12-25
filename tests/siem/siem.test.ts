import { SIEMCollector } from '../../siem';
describe('SIEMCollector', () => {
  it('should collect events', async () => {
    const collector = new SIEMCollector({ endpoint: 'http://siem.local' });
    await collector.collect({ type: 'LoginAttempt', severity: 'low', source: 'auth', details: { user: 'test' } });
    expect(collector.pendingEvents()).toBe(1);
    collector.dispose();
  });
});
