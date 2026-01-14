import { useState } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ReportTemplate, Report, ReportFilters } from '@/types';
import { format, subDays } from 'date-fns';

interface Props { open: boolean; onClose: () => void; templates: ReportTemplate[]; onGenerate: (data: { type: Report['type']; filters: ReportFilters; format: Report['format'] }) => void; }

const formats = [{ value: 'pdf', label: 'PDF' }, { value: 'csv', label: 'CSV' }, { value: 'excel', label: 'Excel' }];

export const GenerateReportDialog = ({ open, onClose, templates, onGenerate }: Props) => {
  const [form, setForm] = useState({ type: 'activity' as Report['type'], format: 'pdf' as Report['format'], startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') });

  const handleSubmit = () => { onGenerate({ type: form.type, filters: { startDate: form.startDate, endDate: form.endDate }, format: form.format }); };

  const typeOptions = templates.map(t => ({ value: t.type, label: t.name }));

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader><DialogTitle>Generate Report</DialogTitle></DialogHeader>
      <DialogContent>
        <Select label="Report Type" options={typeOptions} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Report['type'] })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
          <Input label="End Date" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
        </div>
        <Select label="Format" options={formats} value={form.format} onChange={e => setForm({ ...form, format: e.target.value as Report['format'] })} />
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Generate</Button>
      </DialogFooter>
    </Dialog>
  );
};