import { IaCManager, TerraformRunner, PulumiRunner } from '../../iac';
describe('IaCManager', () => {
  let manager: IaCManager;
  beforeEach(() => { manager = new IaCManager({ provider: 'terraform' }); });
  it('should plan infrastructure', async () => {
    const plan = await manager.plan({ config: {} });
    expect(plan.changes).toBeDefined();
  });
  it('should apply infrastructure', async () => {
    const result = await manager.apply({ config: {}, autoApprove: true });
    expect(result.success).toBeDefined();
  });
  it('should destroy infrastructure', async () => {
    const result = await manager.destroy({ autoApprove: true });
    expect(result.success).toBeDefined();
  });
  it('should validate configuration', async () => {
    const valid = await manager.validate({ config: {} });
    expect(valid.isValid).toBeDefined();
  });
});