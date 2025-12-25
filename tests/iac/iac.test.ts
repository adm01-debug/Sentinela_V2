import { IaCProvider } from '../../iac';

describe('IaCProvider', () => {
  it('should plan infrastructure changes', async () => {
    const provider = new IaCProvider({ backend: 'terraform' });
    const plan = await provider.plan('./infrastructure');
    expect(plan.changes).toBeDefined();
  });
});
