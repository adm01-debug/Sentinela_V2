import { DashboardBuilder } from '../../dashboard';
describe('DashboardBuilder', () => {
  it('should build dashboard', () => {
    const dashboard = new DashboardBuilder()
      .setTitle('System Metrics')
      .addPanel({ title: 'CPU', type: 'gauge' })
      .addPanel({ title: 'Memory', type: 'graph' })
      .build();
    expect(dashboard.title).toBe('System Metrics');
    expect(dashboard.panels.length).toBe(2);
  });
});
