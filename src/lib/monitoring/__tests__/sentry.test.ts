import { describe, it, expect, vi } from 'vitest';

vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
}));

import * as sentry from '../sentry';

describe('Sentry', () => {
  it('should export initSentry', () => { expect(sentry.initSentry).toBeDefined(); });
  it('should export captureException', () => { expect(sentry.captureException).toBeDefined(); });
});
