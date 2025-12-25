import { AlertManager, RuleEvaluator } from '../../src/alerting';

describe('AlertManager', () => {
  let manager: AlertManager;

  beforeEach(() => {
    manager = new AlertManager();
  });

  it('should fire alert', () => {
    manager.fire({
      name: 'HighCPU',
      severity: 'warning',
      message: 'CPU usage above 80%',
      labels: { host: 'server-1' }
    });

    const alerts = manager.getActive();
    expect(alerts.length).toBe(1);
    expect(alerts[0].name).toBe('HighCPU');
  });

  it('should resolve alert', () => {
    manager.fire({
      name: 'TestAlert',
      severity: 'critical',
      message: 'Test',
      labels: {}
    });

    manager.resolve('TestAlert', {});
    const alerts = manager.getActive();
    expect(alerts.length).toBe(0);
  });

  it('should silence alerts', () => {
    manager.silence({
      matchers: [{ name: 'severity', value: 'info' }],
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 3600000)
    });

    manager.fire({
      name: 'InfoAlert',
      severity: 'info',
      message: 'Info message',
      labels: { severity: 'info' }
    });

    // Should not appear in active (silenced)
    const alerts = manager.getActive();
    const infoAlerts = alerts.filter(a => a.severity === 'info');
    expect(infoAlerts.length).toBe(0);
  });
});

describe('RuleEvaluator', () => {
  it('should evaluate threshold rule', () => {
    const evaluator = new RuleEvaluator();
    
    const rule = {
      name: 'HighMemory',
      expr: 'memory_usage > 90',
      for: '5m',
      labels: { severity: 'critical' },
      annotations: { summary: 'High memory' }
    };

    const result = evaluator.evaluate(rule, { memory_usage: 95 });
    expect(result.firing).toBe(true);
  });
});
