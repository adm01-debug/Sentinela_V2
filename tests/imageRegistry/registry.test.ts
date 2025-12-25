import { ImageRegistry } from '../../imageRegistry';

describe('ImageRegistry', () => {
  it('should push image', async () => {
    const registry = new ImageRegistry({ url: 'registry.example.com' });
    const result = await registry.push('myapp:v1.0.0');
    expect(result.digest).toBeDefined();
  });
});
