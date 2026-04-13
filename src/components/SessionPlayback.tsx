import { useState, memo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Video, User, CalendarIcon, Mouse, Keyboard, Maximize2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlaybackControls } from './session-playback/PlaybackControls';
import { DensityMap } from './session-playback/DensityMap';

interface SessionEvent {
  type: 'click' | 'keystroke';
  timestamp: string;
  data: { x?: number; y?: number; click_type?: string; key?: string };
}

interface SessionRecording {
  id: string;
  employee_name: string;
  device: string | null;
  screenshot_url: string;
  app_name: string | null;
  window_title: string | null;
  events: SessionEvent[];
  recorded_at: string;
}

export const SessionPlayback = memo(() => {
  const [employees, setEmployees] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [recordings, setRecordings] = useState<SessionRecording[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const hourlyDensity = recordings.reduce<Record<number, number>>((acc, rec) => {
    const hour = new Date(rec.recorded_at).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});
  const maxDensity = Math.max(...Object.values(hourlyDensity), 1);

  const jumpToHour = (hour: number) => {
    setSelectedHour(hour);
    const targetIndex = recordings.findIndex(rec => new Date(rec.recorded_at).getHours() >= hour);
    if (targetIndex !== -1) { setCurrentIndex(targetIndex); setIsPlaying(false); }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await supabase.from('session_recordings').select('employee_name').order('recorded_at', { ascending: false });
      if (data) {
        const unique = [...new Set(data.map((d: { employee_name: string }) => d.employee_name))] as string[];
        setEmployees(unique);
        if (unique.length > 0 && !selectedEmployee) setSelectedEmployee(unique[0]);
      }
    };
    fetchEmployees();
  }, []);

  const fetchRecordings = async () => {
    if (!selectedEmployee || !selectedDate) return;
    setLoading(true);
    const startOfDay = new Date(selectedDate); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate); endOfDay.setHours(23, 59, 59, 999);
    const { data } = await supabase.from('session_recordings').select('*').eq('employee_name', selectedEmployee).gte('recorded_at', startOfDay.toISOString()).lte('recorded_at', endOfDay.toISOString()).order('recorded_at', { ascending: true });
    if (data) {
      const parsed = data.map((d) => ({ ...d, id: d.id as string, employee_name: d.employee_name as string, device: d.device as string | null, screenshot_url: d.screenshot_url as string, app_name: d.app_name as string | null, window_title: d.window_title as string | null, recorded_at: d.recorded_at as string, events: Array.isArray(d.events) ? (d.events as SessionEvent[]) : [] })) as SessionRecording[];
      setRecordings(parsed); setCurrentIndex(0);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRecordings(); setIsPlaying(false); }, [selectedEmployee, selectedDate]);

  useEffect(() => {
    if (isPlaying && recordings.length > 0) {
      playIntervalRef.current = setInterval(() => {
        setCurrentIndex(prev => { if (prev >= recordings.length - 1) { setIsPlaying(false); return prev; } return prev + 1; });
      }, 1000 / playbackSpeed);
    } else if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
  }, [isPlaying, recordings.length, playbackSpeed]);

  const currentRecording = recordings[currentIndex];
  const progress = recordings.length > 0 ? (currentIndex / (recordings.length - 1)) * 100 : 0;
  const handleSliderChange = (value: number[]) => { const newIndex = Math.round((value[0] / 100) * (recordings.length - 1)); setCurrentIndex(Math.max(0, Math.min(newIndex, recordings.length - 1))); };
  const countEvents = (events: SessionEvent[]) => ({ clicks: events.filter(e => e.type === 'click').length, keystrokes: events.filter(e => e.type === 'keystroke').length });

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5 text-primary" />Session Playback</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Funcionário" /></SelectTrigger>
              <SelectContent>{employees.map((emp) => <SelectItem key={emp} value={emp}><span className="flex items-center gap-2"><User className="h-4 w-4" />{emp}</span></SelectItem>)}</SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild><Button variant="outline" className="w-[140px]"><CalendarIcon className="mr-2 h-4 w-4" />{format(selectedDate, "dd/MM/yyyy")}</Button></PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end"><Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} locale={ptBR} /></PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-[400px] bg-muted/50 rounded-lg"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : recordings.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] bg-muted/50 rounded-lg"><p className="text-muted-foreground">Nenhuma gravação encontrada para esta data</p></div>
          ) : (
            <>
              <div className="relative group">
                <img src={currentRecording?.screenshot_url} alt="Session screenshot" className="w-full h-auto rounded-lg border cursor-pointer" onClick={() => setFullscreenOpen(true)} />
                {currentRecording?.events.map((event, idx) => event.type === 'click' && event.data.x && event.data.y && (
                  <div key={idx} className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full bg-primary/50 border-2 border-primary animate-ping" style={{ left: `${(event.data.x / 1920) * 100}%`, top: `${(event.data.y / 1080) * 100}%` }} />
                ))}
                <Button variant="secondary" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setFullscreenOpen(true)}><Maximize2 className="h-4 w-4" /></Button>
                {currentRecording && (
                  <div className="absolute bottom-2 left-2 flex gap-2">
                    {countEvents(currentRecording.events).clicks > 0 && <Badge variant="secondary" className="bg-background/80"><Mouse className="h-3 w-3 mr-1" />{countEvents(currentRecording.events).clicks}</Badge>}
                    {countEvents(currentRecording.events).keystrokes > 0 && <Badge variant="secondary" className="bg-background/80"><Keyboard className="h-3 w-3 mr-1" />{countEvents(currentRecording.events).keystrokes}</Badge>}
                  </div>
                )}
              </div>

              <DensityMap hourlyDensity={hourlyDensity} maxDensity={maxDensity} totalRecordings={recordings.length} currentHour={currentRecording ? new Date(currentRecording.recorded_at).getHours() : null} selectedHour={selectedHour} onJumpToHour={jumpToHour} />

              <PlaybackControls currentRecording={currentRecording} lastRecording={recordings[recordings.length - 1]} currentIndex={currentIndex} totalRecordings={recordings.length} progress={progress} isPlaying={isPlaying} playbackSpeed={playbackSpeed} onSliderChange={handleSliderChange} onPlayPause={() => setIsPlaying(!isPlaying)} onSkipBack={() => setCurrentIndex(prev => Math.max(0, prev - 10))} onSkipForward={() => setCurrentIndex(prev => Math.min(recordings.length - 1, prev + 10))} onSpeedChange={setPlaybackSpeed} />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Video className="h-5 w-5" />{selectedEmployee} - Session Playback</DialogTitle></DialogHeader>
          {currentRecording && (
            <div className="space-y-2">
              <div className="relative">
                <img src={currentRecording.screenshot_url} alt="Full screen screenshot" className="w-full h-auto rounded-lg" />
                {currentRecording.events.map((event, idx) => event.type === 'click' && event.data.x && event.data.y && (
                  <div key={idx} className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-primary/50 border-2 border-primary" style={{ left: `${(event.data.x / 1920) * 100}%`, top: `${(event.data.y / 1080) * 100}%` }} />
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{format(new Date(currentRecording.recorded_at), "HH:mm:ss dd/MM/yyyy")}</span>
                <span>{currentRecording.app_name} - {currentRecording.window_title}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});
