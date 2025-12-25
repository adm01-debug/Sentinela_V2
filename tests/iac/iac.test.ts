import { IaCProvider, Resource, Stack } from '../../iac';
describe('IaCProvider', () => {
  let provider: IaCProvider;
  beforeEach(() => { provider = new IaCProvider({ type: 'terraform' }); });
  it('should plan changes', async () => {
    const plan = await provider.plan({
      resources: [{ type: 'server', name: 'web', config: { size: 'small' } }]
    });
    expect(plan.changes).toBeDefined();
  });
  it('should apply changes', async () => {
    const result = await provider.apply({
      resources: [{ type: 'server', name: 'web', config: {} }]
    });
    expect(result.applied).toBeDefined();
  });
  it('should destroy resources', async () => {
    const result = await provider.destroy(['web-server']);
    expect(result.destroyed).toBeDefined();
  });
  it('should get state', async () => {
    const state = await provider.getState();
    expect(state.resources).toBeDefined();
  });
});