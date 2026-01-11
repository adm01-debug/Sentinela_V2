import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { GeneralSettings as Settings } from '@/types';

interface Props { settings?: Settings; onSave: (data: Partial<Settings>) => void; }

const timezones = [{ value: 'America/New_York', label: 'Eastern Time' }, { value: 'America/Chicago', label: 'Central Time' }, { value: 'America/Los_Angeles', label: 'Pacific Time' }, { value: 'America/Sao_Paulo', label: 'São Paulo' }, { value: 'UTC', label: 'UTC' }];
const languages = [{ value: 'en', label: 'English' }, { value: 'pt', label: 'Português' }, { value: 'es', label: 'Español' }];

export const GeneralSettings = ({ settings, onSave }: Props) => {
  const [form, setForm] = useState({ companyName: '', timezone: 'UTC', dateFormat: 'yyyy-MM-dd', language: 'en' });
  useEffect(() => { if (settings) setForm({ ...settings }); }, [settings]);

  return (
    <Card>
      <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Input label="Company Name" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
        <Select label="Timezone" options={timezones} value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })} />
        <Select label="Language" options={languages} value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} />
        <Button onClick={() => onSave(form)}>Save Changes</Button>
      </CardContent>
    </Card>
  );
};