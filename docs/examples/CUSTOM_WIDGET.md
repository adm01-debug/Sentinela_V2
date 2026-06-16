# Example: Custom Widget

```typescript
import { WidgetBase, useWidgetData } from '@/components';
export const CustomWidget = () => {
  const { data, loading } = useWidgetData('custom-endpoint');
  return (
    <WidgetBase title="Custom Metric" loading={loading}>
      <div>{data?.value}</div>
    </WidgetBase>
  );
};
```
