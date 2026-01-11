import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Search, X } from 'lucide-react';

interface FiltersProps { filters: Record<string, string>; onChange: (filters: Record<string, string>) => void; }

const departments = [{ value: '', label: 'All Departments' }, { value: 'engineering', label: 'Engineering' }, { value: 'sales', label: 'Sales' }, { value: 'marketing', label: 'Marketing' }, { value: 'hr', label: 'HR' }];
const statuses = [{ value: '', label: 'All Statuses' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }];

export const EmployeeFilters = ({ filters, onChange }: FiltersProps) => (
  <div className="flex gap-4 items-end">
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Search employees..." className="pl-10" value={filters.search || ''} onChange={e => onChange({ ...filters, search: e.target.value })} />
    </div>
    <Select options={departments} value={filters.department || ''} onChange={e => onChange({ ...filters, department: e.target.value })} />
    <Select options={statuses} value={filters.status || ''} onChange={e => onChange({ ...filters, status: e.target.value })} />
    {Object.values(filters).some(Boolean) && (
      <Button variant="ghost" onClick={() => onChange({})}><X className="h-4 w-4" /></Button>
    )}
  </div>
);