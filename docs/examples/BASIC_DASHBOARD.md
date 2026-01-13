# Example: Basic Dashboard Setup
```typescript
import { DashboardLayout, StatCard, ActivityChart } from '@/components';
export const BasicDashboard = () => (
  <DashboardLayout>
    <StatCard title="Active Employees" value={42} change={5} />
    <StatCard title="Productivity" value="87%" change={-2} />
    <ActivityChart data={activityData} />
  </DashboardLayout>
);
```
