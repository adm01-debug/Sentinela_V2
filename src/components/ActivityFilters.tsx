import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Props { filters: { startDate: string; endDate: string; employeeId?: string }; onChange: (f: any) => void; }

export const ActivityFilters = ({ filters, onChange }: Props) => (
  <div className="flex gap-4 items-end">
    <Input label="Start Date" type="date" value={filters.startDate} onChange={e => onChange({ ...filters, startDate: e.target.value })} />
    <Input label="End Date" type="date" value={filters.endDate} onChange={e => onChange({ ...filters, endDate: e.target.value })} />
    <Button variant="outline" onClick={() => { const end = new Date(); const start = new Date(Date.now() - 7*24*60*60*1000); onChange({ ...filters, startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] }); }}>Last 7 days</Button>
    <Button variant="outline" onClick={() => { const end = new Date(); const start = new Date(Date.now() - 30*24*60*60*1000); onChange({ ...filters, startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] }); }}>Last 30 days</Button>
  </div>
);