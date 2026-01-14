import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Props { filters: { severity?: string; acknowledged?: boolean }; onChange: (f: any) => void; }

const severities = [{ value: '', label: 'All Severities' }, { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }];
const acknowledgement = [{ value: '', label: 'All' }, { value: 'false', label: 'Unacknowledged' }, { value: 'true', label: 'Acknowledged' }];

export const AlertFilters = ({ filters, onChange }: Props) => (
  <div className="flex gap-4">
    <Select options={severities} value={filters.severity || ''} onChange={e => onChange({ ...filters, severity: e.target.value || undefined })} />
    <Select options={acknowledgement} value={filters.acknowledged === undefined ? '' : String(filters.acknowledged)} onChange={e => onChange({ ...filters, acknowledged: e.target.value === '' ? undefined : e.target.value === 'true' })} />
    {(filters.severity || filters.acknowledged !== undefined) && <Button variant="ghost" onClick={() => onChange({})}><X className="h-4 w-4" /></Button>}
  </div>
);