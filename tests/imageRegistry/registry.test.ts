import { ImageRegistry } from '../../imageRegistry';
describe('ImageRegistry', () => {
  let registry: ImageRegistry;
  beforeEach(() => { registry = new ImageRegistry({ url: 'registry.local' }); });
  it('should push and list images', async () => {
    await registry.push({ name: 'app', tag: 'v1', digest: 'sha256:abc', size: 1000 });
    const images = await registry.list();
    expect(images).toContain('app');
    expect(await registry.getTags('app')).toContain('v1');
  });
});
