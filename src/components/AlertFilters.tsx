import { X } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Props {
  filters: { severity?: string; acknowledged?: boolean };
  onChange: (f: { severity?: string; acknowledged?: boolean }) => void;
}

const severities = [
  { value: 'all', label: 'All Severities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const acknowledgement = [
  { value: 'all', label: 'All' },
  { value: 'false', label: 'Unacknowledged' },
  { value: 'true', label: 'Acknowledged' },
];

export const AlertFilters = ({ filters, onChange }: Props) => (
  <div className="flex gap-4">
    <Select
      value={filters.severity || 'all'}
      onValueChange={(value) =>
        onChange({ ...filters, severity: value === 'all' ? undefined : value })
      }
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Severity" />
      </SelectTrigger>
      <SelectContent>
        {severities.map((sev) => (
          <SelectItem key={sev.value} value={sev.value}>
            {sev.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <Select
      value={
        filters.acknowledged === undefined ? 'all' : String(filters.acknowledged)
      }
      onValueChange={(value) =>
        onChange({
          ...filters,
          acknowledged: value === 'all' ? undefined : value === 'true',
        })
      }
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {acknowledgement.map((ack) => (
          <SelectItem key={ack.value} value={ack.value}>
            {ack.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {(filters.severity || filters.acknowledged !== undefined) && (
      <Button variant="ghost" size="icon" onClick={() => onChange({})}>
        <X className="h-4 w-4" />
      </Button>
    )}
  </div>
);
