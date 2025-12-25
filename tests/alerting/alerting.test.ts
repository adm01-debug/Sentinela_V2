import { AlertManager, AlertRule, AlertNotifier } from '../../alerting';

describe('AlertManager', () => {
  let manager: AlertManager;

  beforeEach(() => {
    manager = new AlertManager();
  });

  it('should add alert rules', () => {
    manager.addRule({
      name: 'high-cpu',
      condition: (metrics) => metrics.cpu > 90,
      severity: 'critical',
      cooldown: 300
    });

    expect(manager.getRules().length).toBe(1);
  });

  it('should trigger alert when condition met', async () => {
    const notifier = { notify: jest.fn() };
    manager.setNotifier(notifier);

    manager.addRule({
      name: 'high-memory',
      condition: (m) => m.memory > 80,
      severity: 'warning'
    });

    await manager.evaluate({ memory: 95 });

    expect(notifier.notify).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'high-memory' })
    );
  });

  it('should respect cooldown period', async () => {
    const notifier = { notify: jest.fn() };
    manager.setNotifier(notifier);

    manager.addRule({
      name: 'test-alert',
      condition: () => true,
      severity: 'info',
      cooldown: 60000
    });

    await manager.evaluate({});
    await manager.evaluate({});

    expect(notifier.notify).toHaveBeenCalledTimes(1);
  });

  it('should resolve alerts', async () => {
    const notifier = { notify: jest.fn() };
    manager.setNotifier(notifier);

    manager.addRule({
      name: 'recoverable',
      condition: (m) => m.value > 100,
      severity: 'warning'
    });

    await manager.evaluate({ value: 150 }); // Trigger
    await manager.evaluate({ value: 50 });  // Resolve

    const activeAlerts = manager.getActiveAlerts();
    expect(activeAlerts.length).toBe(0);
  });
});
