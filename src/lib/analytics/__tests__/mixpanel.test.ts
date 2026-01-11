import { describe, it, expect } from 'vitest';
import * as mp from '../mixpanel';

describe('Mixpanel', () => {
  it('should export functions', () => { expect(mp.initMixpanel).toBeDefined(); });
});
