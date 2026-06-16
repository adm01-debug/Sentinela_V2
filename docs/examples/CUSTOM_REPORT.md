# Example: Custom Report

```typescript
import { ReportBuilder, useReportData } from '@/lib/reports';
export const CustomReport = ({ dateRange, employees }) => {
  const { data } = useReportData({ dateRange, employees, metrics: ['productivity', 'activity', 'violations'] });
  return (
    <ReportBuilder title="Custom Productivity Report" data={data} columns={['Employee', 'Hours', 'Productivity', 'Violations']}
      exportFormats={['pdf', 'excel']} />
  );
};
```
