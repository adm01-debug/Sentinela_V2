import { describe, it, expect } from 'vitest';
import { getImageDimensions, calculateAspectRatio, fitImageInContainer } from '../image';

describe('image utilities', () => {
  it('should calculate aspect ratio', () => {
    expect(calculateAspectRatio(1920, 1080)).toBeCloseTo(1.78, 1);
    expect(calculateAspectRatio(1080, 1080)).toBe(1);
  });

  it('should fit image in container (contain)', () => {
    const result = fitImageInContainer(1920, 1080, 800, 600, 'contain');
    expect(result.width).toBeLessThanOrEqual(800);
    expect(result.height).toBeLessThanOrEqual(600);
  });

  it('should fit image in container (cover)', () => {
    const result = fitImageInContainer(1920, 1080, 800, 600, 'cover');
    expect(result.width).toBeGreaterThanOrEqual(800);
  });
});
