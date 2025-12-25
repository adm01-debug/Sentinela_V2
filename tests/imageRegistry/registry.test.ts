import { ImageRegistry, Image, Tag } from '../../imageRegistry';
describe('ImageRegistry', () => {
  let registry: ImageRegistry;
  beforeEach(() => { registry = new ImageRegistry({ url: 'localhost:5000' }); });
  it('should push image', async () => {
    const result = await registry.push({ name: 'myapp', tag: 'v1.0.0' });
    expect(result.digest).toBeDefined();
  });
  it('should pull image', async () => {
    const result = await registry.pull({ name: 'myapp', tag: 'v1.0.0' });
    expect(result.success).toBe(true);
  });
  it('should list tags', async () => {
    await registry.push({ name: 'app', tag: 'v1' });
    await registry.push({ name: 'app', tag: 'v2' });
    const tags = await registry.listTags('app');
    expect(tags.length).toBe(2);
  });
  it('should delete tag', async () => {
    await registry.push({ name: 'temp', tag: 'latest' });
    await registry.delete({ name: 'temp', tag: 'latest' });
    const tags = await registry.listTags('temp');
    expect(tags.length).toBe(0);
  });
});