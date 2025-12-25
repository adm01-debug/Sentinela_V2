import { Result, PaginatedResult } from '../../core/types';

describe('Core Types', () => {
  it('should work with Result type', () => {
    const success: Result<string> = { success: true, data: 'ok' };
    const failure: Result<string> = { success: false, error: new Error('fail') };
    expect(success.success).toBe(true);
    expect(failure.success).toBe(false);
  });

  it('should work with PaginatedResult', () => {
    const result: PaginatedResult<number> = {
      items: [1, 2, 3],
      total: 100,
      page: 1,
      pageSize: 3,
      hasNext: true,
      hasPrev: false
    };
    expect(result.items.length).toBe(3);
    expect(result.hasNext).toBe(true);
  });
});
