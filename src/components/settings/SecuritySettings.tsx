import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface SecuritySettingsData {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
}

interface Props { settings?: SecuritySettingsData; onSave: (data: Partial<SecuritySettingsData>) => void; }

export const SecuritySettings = ({ settings, onSave }: Props) => {
  const [form, setForm] = useState<SecuritySettingsData>({ twoFactorEnabled: false, sessionTimeout: 30, passwordMinLength: 8, passwordRequireSpecial: true });
  useEffect(() => { if (settings) setForm({ ...settings }); }, [settings]);

  return (
    <Card>
      <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Enable Two-Factor Authentication</Label>
          <Switch checked={form.twoFactorEnabled} onCheckedChange={(v: boolean) => setForm({ ...form, twoFactorEnabled: v })} />
        </div>
        <div>
          <Label>Session Timeout (minutes)</Label>
          <Input type="number" value={form.sessionTimeout} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, sessionTimeout: Number(e.target.value) })} />
        </div>
        <div>
          <Label>Minimum Password Length</Label>
          <Input type="number" value={form.passwordMinLength} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, passwordMinLength: Number(e.target.value) })} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Require Special Characters in Password</Label>
          <Switch checked={form.passwordRequireSpecial} onCheckedChange={(v: boolean) => setForm({ ...form, passwordRequireSpecial: v })} />
        </div>
        <Button onClick={() => onSave(form)}>Save Changes</Button>
      </CardContent>
    </Card>
  );
};