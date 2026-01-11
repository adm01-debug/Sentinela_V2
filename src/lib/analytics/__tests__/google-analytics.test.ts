import { describe, it, expect } from 'vitest';
import * as ga from '../google-analytics';

describe('Google Analytics', () => {
  it('should export initGA', () => { expect(ga.initGA).toBeDefined(); });
  it('should export trackEvent', () => { expect(ga.trackEvent).toBeDefined(); });
});
