import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Switch } from '../ui/Switch';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { NotificationSettings as Settings } from '@/types';

interface Props { settings?: Settings; onSave: (data: Partial<Settings>) => void; }

const severities = [{ value: 'low', label: 'Low and above' }, { value: 'medium', label: 'Medium and above' }, { value: 'high', label: 'High and above' }, { value: 'critical', label: 'Critical only' }];

export const NotificationSettings = ({ settings, onSave }: Props) => {
  const [form, setForm] = useState({ email: true, push: true, slack: false, slackWebhook: '', alertThreshold: 'medium' as Settings['alertThreshold'] });
  useEffect(() => { if (settings) setForm({ ...form, ...settings }); }, [settings]);

  return (
    <Card>
      <CardHeader><CardTitle>Notification Settings</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Switch checked={form.email} onChange={v => setForm({ ...form, email: v })} label="Email Notifications" />
        <Switch checked={form.push} onChange={v => setForm({ ...form, push: v })} label="Push Notifications" />
        <Switch checked={form.slack} onChange={v => setForm({ ...form, slack: v })} label="Slack Notifications" />
        {form.slack && <Input label="Slack Webhook URL" value={form.slackWebhook || ''} onChange={e => setForm({ ...form, slackWebhook: e.target.value })} />}
        <Select label="Alert Threshold" options={severities} value={form.alertThreshold} onChange={e => setForm({ ...form, alertThreshold: e.target.value as Settings['alertThreshold'] })} />
        <Button onClick={() => onSave(form)}>Save Changes</Button>
      </CardContent>
    </Card>
  );
};