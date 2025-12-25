import { SIEMCollector } from '../../siem';

describe('SIEMCollector', () => {
  let collector: SIEMCollector;
  beforeEach(() => { collector = new SIEMCollector({ endpoint: 'http://siem.local' }); });

  it('should collect security events', async () => {
    await collector.collect({ type: 'LOGIN_ATTEMPT', userId: 'user1', success: true });
    expect(collector.pendingEvents()).toBe(1);
  });

  it('should flush events', async () => {
    await collector.collect({ type: 'LOGIN_ATTEMPT', userId: 'user1', success: true });
    await collector.flush();
    expect(collector.pendingEvents()).toBe(0);
  });
});
