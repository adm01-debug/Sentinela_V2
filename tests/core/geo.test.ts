import { distance, isWithinRadius, boundingBox } from '../../core/geo';
describe('Geo', () => {
  const nyc = { lat: 40.7128, lon: -74.0060 };
  const la = { lat: 34.0522, lon: -118.2437 };
  it('should calculate distance', () => { expect(distance(nyc, la)).toBeGreaterThan(3900); expect(distance(nyc, la)).toBeLessThan(4000); });
  it('should check within radius', () => { expect(isWithinRadius(nyc, nyc, 1)).toBe(true); expect(isWithinRadius(la, nyc, 100)).toBe(false); });
  it('should calculate bounding box', () => { const box = boundingBox(nyc, 10); expect(box.minLat).toBeLessThan(nyc.lat); expect(box.maxLat).toBeGreaterThan(nyc.lat); });
});
