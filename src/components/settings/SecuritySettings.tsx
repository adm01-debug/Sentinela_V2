import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { SecuritySettings as Settings } from '@/types';

interface Props { settings?: Settings; onSave: (data: Partial<Settings>) => void; }

export const SecuritySettings = ({ settings, onSave }: Props) => {
  const [form, setForm] = useState({ twoFactorEnabled: false, sessionTimeout: 30, passwordMinLength: 8, passwordRequireSpecial: true });
  useEffect(() => { if (settings) setForm({ ...settings }); }, [settings]);

  return (
    <Card>
      <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Switch checked={form.twoFactorEnabled} onChange={v => setForm({ ...form, twoFactorEnabled: v })} label="Enable Two-Factor Authentication" />
        <Input label="Session Timeout (minutes)" type="number" value={form.sessionTimeout} onChange={e => setForm({ ...form, sessionTimeout: Number(e.target.value) })} />
        <Input label="Minimum Password Length" type="number" value={form.passwordMinLength} onChange={e => setForm({ ...form, passwordMinLength: Number(e.target.value) })} />
        <Switch checked={form.passwordRequireSpecial} onChange={v => setForm({ ...form, passwordRequireSpecial: v })} label="Require Special Characters in Password" />
        <Button onClick={() => onSave(form)}>Save Changes</Button>
      </CardContent>
    </Card>
  );
};