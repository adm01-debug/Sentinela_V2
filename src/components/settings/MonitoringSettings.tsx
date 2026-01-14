import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface MonitoringSettingsData {
  screenshotEnabled: boolean;
  screenshotInterval: number;
  screenshotQuality: 'low' | 'medium' | 'high';
  blurScreenshots: boolean;
  trackKeystrokes: boolean;
  trackMouseClicks: boolean;
  idleThreshold: number;
}

interface Props {
  settings?: MonitoringSettingsData;
  onSave: (data: Partial<MonitoringSettingsData>) => void;
}

export const MonitoringSettings = ({ settings, onSave }: Props) => {
  const [form, setForm] = useState<MonitoringSettingsData>({
    screenshotEnabled: true,
    screenshotInterval: 5,
    screenshotQuality: 'medium',
    blurScreenshots: false,
    trackKeystrokes: false,
    trackMouseClicks: false,
    idleThreshold: 300,
  });

  useEffect(() => {
    if (settings) setForm({ ...form, ...settings });
  }, [settings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monitoring Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="screenshotEnabled">Enable Screenshots</Label>
          <Switch
            id="screenshotEnabled"
            checked={form.screenshotEnabled}
            onCheckedChange={(v: boolean) => setForm({ ...form, screenshotEnabled: v })}
          />
        </div>
        {form.screenshotEnabled && (
          <>
            <div className="space-y-2">
              <Label>Screenshot Interval (minutes)</Label>
              <Input
                type="number"
                value={form.screenshotInterval}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, screenshotInterval: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Screenshot Quality</Label>
              <Select value={form.screenshotQuality} onValueChange={(v: 'low' | 'medium' | 'high') => setForm({ ...form, screenshotQuality: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="blur">Blur Sensitive Areas</Label>
              <Switch id="blur" checked={form.blurScreenshots} onCheckedChange={(v: boolean) => setForm({ ...form, blurScreenshots: v })} />
            </div>
          </>
        )}
        <div className="flex items-center justify-between">
          <Label htmlFor="keystrokes">Track Keystrokes</Label>
          <Switch id="keystrokes" checked={form.trackKeystrokes} onCheckedChange={(v: boolean) => setForm({ ...form, trackKeystrokes: v })} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="clicks">Track Mouse Clicks</Label>
          <Switch id="clicks" checked={form.trackMouseClicks} onCheckedChange={(v: boolean) => setForm({ ...form, trackMouseClicks: v })} />
        </div>
        <div className="space-y-2">
          <Label>Idle Threshold (seconds)</Label>
          <Input
            type="number"
            value={form.idleThreshold}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, idleThreshold: Number(e.target.value) })}
          />
        </div>
        <Button onClick={() => onSave(form)}>Save Changes</Button>
      </CardContent>
    </Card>
  );
};
