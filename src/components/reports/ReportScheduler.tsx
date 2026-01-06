import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Save, Play, Pause, Trash2 } from 'lucide-react';

interface Schedule { id: string; reportId: string; reportName: string; frequency: 'daily' | 'weekly' | 'monthly'; time: string; day?: number; recipients: string[]; enabled: boolean; }

export function ReportScheduler({ schedules, onSave, onToggle, onDelete, className }: { schedules: Schedule[]; onSave?: (schedule: Omit<Schedule, 'id'>) => void; onToggle?: (id: string) => void; onDelete?: (id: string) => void; className?: string }) {
  const [newSchedule, setNewSchedule] = useState({ reportId: '', reportName: '', frequency: 'daily' as const, time: '09:00', recipients: '' as string, enabled: true });

  const handleSave = () => {
    if (!newSchedule.reportId || !newSchedule.recipients) return;
    onSave?.({ ...newSchedule, recipients: newSchedule.recipients.split(',').map(e => e.trim()) });
    setNewSchedule({ reportId: '', reportName: '', frequency: 'daily', time: '09:00', recipients: '', enabled: true });
  };

  return (
    <Card className={className}>
      <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Report Scheduler</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6 p-4 border rounded-lg">
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Report ID" value={newSchedule.reportId} onChange={(e) => setNewSchedule(p => ({ ...p, reportId: e.target.value }))} />
            <Select value={newSchedule.frequency} onValueChange={(v: any) => setNewSchedule(p => ({ ...p, frequency: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent></Select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input type="time" value={newSchedule.time} onChange={(e) => setNewSchedule(p => ({ ...p, time: e.target.value }))} />
            <Input placeholder="Recipients (comma-separated emails)" value={newSchedule.recipients} onChange={(e) => setNewSchedule(p => ({ ...p, recipients: e.target.value }))} />
          </div>
          <Button className="w-full" onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save Schedule</Button>
        </div>
        <div className="space-y-3">
          {schedules.map(s => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="flex-1"><p className="font-medium text-sm">{s.reportName || s.reportId}</p><p className="text-xs text-muted-foreground">{s.frequency} at {s.time} • {s.recipients.length} recipient(s)</p></div>
              <Switch checked={s.enabled} onCheckedChange={() => onToggle?.(s.id)} />
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete?.(s.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          {schedules.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No scheduled reports</p>}
        </div>
      </CardContent>
    </Card>
  );
}
export default ReportScheduler;
