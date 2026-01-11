import { describe, it, expect } from 'vitest';
import { checkHealth } from '../health-check';

describe('Health Check', () => {
  it('should return health status', async () => {
    const status = await checkHealth();
    expect(status.status).toBeDefined();
  });
});
