import { DashboardBuilder } from '../../dashboard';
describe('DashboardBuilder', () => {
  it('should build dashboard', () => {
    const builder = new DashboardBuilder();
    const dashboard = builder.addPanel({ title: 'CPU', type: 'gauge' }).build();
    expect(dashboard.panels.length).toBe(1);
  });
});
