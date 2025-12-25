import { AlertManager } from '../../alerting';

describe('AlertManager', () => {
  let manager: AlertManager;
  beforeEach(() => { manager = new AlertManager(); });

  it('should create alert', async () => {
    const alert = await manager.create({ name: 'HighCPU', severity: 'warning', condition: 'cpu > 80' });
    expect(alert.id).toBeDefined();
  });

  it('should trigger alert', async () => {
    const handler = jest.fn();
    manager.on('alert', handler);
    await manager.create({ name: 'Test', severity: 'critical', condition: 'true' });
    await manager.evaluate();
    expect(handler).toHaveBeenCalled();
  });
});
