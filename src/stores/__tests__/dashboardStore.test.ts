import { describe, it, expect, beforeEach } from 'vitest';
import { useDashboardStore } from '../dashboardStore';
describe('dashboardStore', () => {
  beforeEach(() => { useDashboardStore.setState({ widgets: [] }); });
  it('adds widget', () => { useDashboardStore.getState().addWidget({ id: '1', type: 'chart', position: { x: 0, y: 0 }, size: { w: 2, h: 2 }, config: {} }); expect(useDashboardStore.getState().widgets).toHaveLength(1); });
});