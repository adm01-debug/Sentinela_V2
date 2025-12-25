import { ImageRegistry, Image, Tag } from '../../imageRegistry';
describe('ImageRegistry', () => {
  let registry: ImageRegistry;
  beforeEach(() => { registry = new ImageRegistry({ url: 'registry.local' }); });
  it('should push image', async () => {
    const result = await registry.push('myapp:v1');
    expect(result.digest).toBeDefined();
  });
  it('should pull image', async () => {
    const result = await registry.pull('myapp:v1');
    expect(result.success).toBe(true);
  });
  it('should list tags', async () => {
    const tags = await registry.listTags('myapp');
    expect(Array.isArray(tags)).toBe(true);
  });
  it('should delete image', async () => {
    await registry.delete('myapp:v1');
    const exists = await registry.exists('myapp:v1');
    expect(exists).toBe(false);
  });
  it('should scan for vulnerabilities', async () => {
    const scan = await registry.scan('myapp:v1');
    expect(scan.vulnerabilities).toBeDefined();
  });
});