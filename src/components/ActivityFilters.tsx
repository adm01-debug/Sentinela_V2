import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  filters: { startDate: string; endDate: string; employeeId?: string };
  onChange: (f: { startDate: string; endDate: string; employeeId?: string }) => void;
}

export const ActivityFilters = ({ filters, onChange }: Props) => (
  <div className="flex gap-4 items-end flex-wrap">
    <div className="space-y-1">
      <Label htmlFor="start-date">Start Date</Label>
      <Input
        id="start-date"
        type="date"
        value={filters.startDate}
        onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
      />
    </div>
    <div className="space-y-1">
      <Label htmlFor="end-date">End Date</Label>
      <Input
        id="end-date"
        type="date"
        value={filters.endDate}
        onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
      />
    </div>
    <Button
      variant="outline"
      onClick={() => {
        const end = new Date();
        const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        onChange({
          ...filters,
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
        });
      }}
    >
      Last 7 days
    </Button>
    <Button
      variant="outline"
      onClick={() => {
        const end = new Date();
        const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        onChange({
          ...filters,
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
        });
      }}
    >
      Last 30 days
    </Button>
  </div>
);
