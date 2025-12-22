import { describe, it, expect } from 'vitest';
import { useReportStore } from '../reportStore';

describe('reportStore', () => {
  it('should have initial state', () => {
    const store = useReportStore.getState();
    expect(store).toBeDefined();
  });
});