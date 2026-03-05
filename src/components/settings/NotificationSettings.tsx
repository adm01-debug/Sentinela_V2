import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface NotificationSettingsProps {
  settings?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    alertNotifications: boolean;
    reportNotifications: boolean;
  };
  onSave?: (data: any) => void;
}

export const NotificationSettings = ({ settings, onSave }: NotificationSettingsProps) => {
  const [form, setForm] = useState({
    emailNotifications: settings?.emailNotifications ?? true,
    pushNotifications: settings?.pushNotifications ?? true,
    alertNotifications: settings?.alertNotifications ?? true,
    reportNotifications: settings?.reportNotifications ?? false,
  });

  return (
    <Card>
      <CardHeader><CardTitle>Notification Settings</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Email Notifications</Label>
          <Switch checked={form.emailNotifications} onCheckedChange={(v) => setForm({ ...form, emailNotifications: v })} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Push Notifications</Label>
          <Switch checked={form.pushNotifications} onCheckedChange={(v) => setForm({ ...form, pushNotifications: v })} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Alert Notifications</Label>
          <Switch checked={form.alertNotifications} onCheckedChange={(v) => setForm({ ...form, alertNotifications: v })} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Report Notifications</Label>
          <Switch checked={form.reportNotifications} onCheckedChange={(v) => setForm({ ...form, reportNotifications: v })} />
        </div>
        <Button onClick={() => onSave?.(form)}>Save Changes</Button>
      </CardContent>
    </Card>
  );
};
