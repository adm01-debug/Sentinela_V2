import { SIEMCollector, SecurityEvent, AlertRule } from '../../siem';

describe('SIEMCollector', () => {
  let collector: SIEMCollector;

  beforeEach(() => {
    collector = new SIEMCollector({
      bufferSize: 100,
      flushInterval: 5000
    });
  });

  afterEach(() => {
    collector.stop();
  });

  it('should collect security events', () => {
    const event: SecurityEvent = {
      type: 'LOGIN_ATTEMPT',
      severity: 'medium',
      source: '192.168.1.1',
      timestamp: new Date(),
      details: { username: 'admin', success: false }
    };

    collector.collect(event);
    expect(collector.getBufferSize()).toBe(1);
  });

  it('should apply alert rules', () => {
    const alertTriggered = jest.fn();
    
    collector.addRule({
      name: 'FailedLoginAlert',
      condition: (e) => e.type === 'LOGIN_ATTEMPT' && !e.details?.success,
      severity: 'high',
      action: alertTriggered
    });

    collector.collect({
      type: 'LOGIN_ATTEMPT',
      severity: 'medium',
      source: '192.168.1.1',
      timestamp: new Date(),
      details: { success: false }
    });

    expect(alertTriggered).toHaveBeenCalled();
  });
});
