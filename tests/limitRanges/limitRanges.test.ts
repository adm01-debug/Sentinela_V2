import { LimitRangeManager, LimitRange, LimitType } from '../../limitRanges';
describe('LimitRangeManager', () => {
  let manager: LimitRangeManager;
  beforeEach(() => { manager = new LimitRangeManager(); });
  it('should create limit range', async () => {
    const lr = await manager.create({
      name: 'default-limits',
      namespace: 'default',
      limits: [{
        type: 'Container',
        default: { cpu: '500m', memory: '512Mi' },
        defaultRequest: { cpu: '100m', memory: '128Mi' },
        max: { cpu: '2', memory: '2Gi' },
        min: { cpu: '50m', memory: '64Mi' }
      }]
    });
    expect(lr.limits[0].type).toBe('Container');
  });
  it('should validate resources', async () => {
    await manager.create({
      name: 'validate-test',
      limits: [{ type: 'Container', max: { cpu: '1' } }]
    });
    const valid = await manager.validate('validate-test', { cpu: '500m' });
    expect(valid).toBe(true);
  });
  it('should reject over limits', async () => {
    await manager.create({
      name: 'over-test',
      limits: [{ type: 'Container', max: { cpu: '1' } }]
    });
    const valid = await manager.validate('over-test', { cpu: '2' });
    expect(valid).toBe(false);
  });
});