import { ImageRegistry } from '../../imageRegistry';
describe('ImageRegistry', () => {
  it('should list images', async () => {
    const registry = new ImageRegistry({ url: 'registry.local' });
    const images = await registry.list();
    expect(Array.isArray(images)).toBe(true);
  });
});
