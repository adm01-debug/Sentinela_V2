import { EdgeComputing, EdgeNode, EdgeFunction } from '../../edgeComputing';
describe('EdgeComputing', () => {
  let edge: EdgeComputing;
  beforeEach(() => { edge = new EdgeComputing(); });
  it('should deploy edge function', async () => {
    const fn = await edge.deployFunction({
      name: 'image-resize',
      handler: async (req) => ({ body: 'resized' }),
      regions: ['us-east-1', 'eu-west-1']
    });
    expect(fn.id).toBeDefined();
  });
  it('should list edge nodes', async () => {
    const nodes = await edge.listNodes();
    expect(Array.isArray(nodes)).toBe(true);
  });
  it('should route to nearest node', async () => {
    const node = await edge.getNearestNode({ lat: 40.7, lon: -74.0 });
    expect(node.region).toBeDefined();
  });
});