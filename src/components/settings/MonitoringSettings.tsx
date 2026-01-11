import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Switch } from '../ui/Switch';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { MonitoringSettings as Settings } from '@/types';

interface Props { settings?: Settings; onSave: (data: Partial<Settings>) => void; }

const qualities = [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }];

export const MonitoringSettings = ({ settings, onSave }: Props) => {
  const [form, setForm] = useState({ screenshotEnabled: true, screenshotInterval: 5, screenshotQuality: 'medium' as Settings['screenshotQuality'], blurScreenshots: false, trackKeystrokes: false, trackMouseClicks: false, idleThreshold: 300 });
  useEffect(() => { if (settings) setForm({ ...form, ...settings }); }, [settings]);

  return (
    <Card>
      <CardHeader><CardTitle>Monitoring Settings</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Switch checked={form.screenshotEnabled} onChange={v => setForm({ ...form, screenshotEnabled: v })} label="Enable Screenshots" />
        {form.screenshotEnabled && (
          <>
            <Input label="Screenshot Interval (minutes)" type="number" value={form.screenshotInterval} onChange={e => setForm({ ...form, screenshotInterval: Number(e.target.value) })} />
            <Select label="Screenshot Quality" options={qualities} value={form.screenshotQuality} onChange={e => setForm({ ...form, screenshotQuality: e.target.value as Settings['screenshotQuality'] })} />
            <Switch checked={form.blurScreenshots} onChange={v => setForm({ ...form, blurScreenshots: v })} label="Blur Sensitive Areas" />
          </>
        )}
        <Switch checked={form.trackKeystrokes} onChange={v => setForm({ ...form, trackKeystrokes: v })} label="Track Keystrokes" />
        <Switch checked={form.trackMouseClicks} onChange={v => setForm({ ...form, trackMouseClicks: v })} label="Track Mouse Clicks" />
        <Input label="Idle Threshold (seconds)" type="number" value={form.idleThreshold} onChange={e => setForm({ ...form, idleThreshold: Number(e.target.value) })} />
        <Button onClick={() => onSave(form)}>Save Changes</Button>
      </CardContent>
    </Card>
  );
};