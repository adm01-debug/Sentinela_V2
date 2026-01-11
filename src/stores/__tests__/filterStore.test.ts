import { describe, it, expect } from 'vitest';
import { useFilterStore } from '../filterStore';
describe('filterStore', () => {
  it('sets date range', () => { useFilterStore.getState().setDateRange('2026-01-01', '2026-01-31'); expect(useFilterStore.getState().filters.dateRange?.start).toBe('2026-01-01'); });
  it('resets filters', () => { useFilterStore.getState().setDepartments(['Eng']); useFilterStore.getState().resetFilters(); expect(useFilterStore.getState().filters.departments).toHaveLength(0); });
});