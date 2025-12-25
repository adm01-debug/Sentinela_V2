import { AlertManager } from '../../alerting';
describe('AlertManager', () => {
  let manager: AlertManager;
  beforeEach(() => { manager = new AlertManager(); });
  it('should create and trigger alerts', async () => {
    const id = await manager.create({ name: 'High CPU', severity: 'warning', condition: 'cpu > 80' });
    await manager.trigger(id);
    // Alert should be triggered
    await manager.resolve(id);
  });
});
