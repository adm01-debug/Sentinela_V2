import { useState, memo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Play, Pause, SkipBack, SkipForward, Video, User, 
  CalendarIcon, Mouse, Keyboard, Clock, Maximize2, BarChart3 
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SessionEvent {
  type: 'click' | 'keystroke';
  timestamp: string;
  data: {
    x?: number;
    y?: number;
    click_type?: string;
    key?: string;
  };
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

  // Get recording counts per hour for density visualization
  const hourlyDensity = recordings.reduce<Record<number, number>>((acc, rec) => {
    const hour = new Date(rec.recorded_at).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  const maxDensity = Math.max(...Object.values(hourlyDensity), 1);

  // Get available hours from recordings
  const availableHours = new Set(Object.keys(hourlyDensity).map(Number));

  // Jump to specific hour
  const jumpToHour = (hour: number) => {
    setSelectedHour(hour);
    const targetIndex = recordings.findIndex(rec => {
      const recHour = new Date(rec.recorded_at).getHours();
      return recHour >= hour;
    });
    if (targetIndex !== -1) {
      setCurrentIndex(targetIndex);
      setIsPlaying(false);
    }
  };

  // Fetch unique employees
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await supabase
        .from('session_recordings')
        .select('employee_name')
        .order('recorded_at', { ascending: false });
      
      if (data) {
        const unique = [...new Set(data.map(d => d.employee_name))];
        setEmployees(unique);
        if (unique.length > 0 && !selectedEmployee) {
          setSelectedEmployee(unique[0]);
        }
      }
    };
    fetchEmployees();
  }, []);

  // Fetch recordings for selected employee and date
  const fetchRecordings = async () => {
    if (!selectedEmployee || !selectedDate) return;
    
    setLoading(true);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data } = await supabase
      .from('session_recordings')
      .select('*')
      .eq('employee_name', selectedEmployee)
      .gte('recorded_at', startOfDay.toISOString())
      .lte('recorded_at', endOfDay.toISOString())
      .order('recorded_at', { ascending: true });
    
    if (data) {
      // Parse events JSONB - handle unknown type from Supabase
      const parsed = data.map(d => ({
        ...d,
        events: Array.isArray(d.events) ? (d.events as unknown as SessionEvent[]) : []
      }));
      setRecordings(parsed);
      setCurrentIndex(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecordings();
    setIsPlaying(false);
  }, [selectedEmployee, selectedDate]);

  // Playback controls
  useEffect(() => {
    if (isPlaying && recordings.length > 0) {
      playIntervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= recordings.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, recordings.length, playbackSpeed]);

  const currentRecording = recordings[currentIndex];
  const progress = recordings.length > 0 ? (currentIndex / (recordings.length - 1)) * 100 : 0;

  const handleSliderChange = (value: number[]) => {
    const newIndex = Math.round((value[0] / 100) * (recordings.length - 1));
    setCurrentIndex(Math.max(0, Math.min(newIndex, recordings.length - 1)));
  };

  const skipBack = () => {
    setCurrentIndex(prev => Math.max(0, prev - 10));
  };

  const skipForward = () => {
    setCurrentIndex(prev => Math.min(recordings.length - 1, prev + 10));
  };

  const countEvents = (events: SessionEvent[]) => {
    const clicks = events.filter(e => e.type === 'click').length;
    const keystrokes = events.filter(e => e.type === 'keystroke').length;
    return { clicks, keystrokes };
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Session Playback
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Funcionário" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp} value={emp}>
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {emp}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[140px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-[400px] bg-muted/50 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recordings.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Nenhuma gravação encontrada para esta data</p>
            </div>
          ) : (
            <>
              {/* Screenshot with event overlays */}
              <div className="relative group">
                <img
                  src={currentRecording?.screenshot_url}
                  alt="Session screenshot"
                  className="w-full h-auto rounded-lg border cursor-pointer"
                  onClick={() => setFullscreenOpen(true)}
                />
                
                {/* Event overlays */}
                {currentRecording?.events.map((event, idx) => (
                  event.type === 'click' && event.data.x && event.data.y && (
                    <div
                      key={idx}
                      className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full bg-primary/50 border-2 border-primary animate-ping"
                      style={{
                        left: `${(event.data.x / 1920) * 100}%`,
                        top: `${(event.data.y / 1080) * 100}%`,
                      }}
                    />
                  )
                ))}

                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setFullscreenOpen(true)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>

                {/* Event badges */}
                {currentRecording && (
                  <div className="absolute bottom-2 left-2 flex gap-2">
                    {countEvents(currentRecording.events).clicks > 0 && (
                      <Badge variant="secondary" className="bg-background/80">
                        <Mouse className="h-3 w-3 mr-1" />
                        {countEvents(currentRecording.events).clicks}
                      </Badge>
                    )}
                    {countEvents(currentRecording.events).keystrokes > 0 && (
                      <Badge variant="secondary" className="bg-background/80">
                        <Keyboard className="h-3 w-3 mr-1" />
                        {countEvents(currentRecording.events).keystrokes}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Density mini-map */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  <span>Densidade de gravações por hora:</span>
                  <span className="text-xs">({recordings.length} total)</span>
                </div>
                
                <TooltipProvider>
                  <div className="flex gap-0.5 h-16 items-end bg-muted/30 rounded-lg p-2">
                    {Array.from({ length: 24 }, (_, hour) => {
                      const count = hourlyDensity[hour] || 0;
                      const heightPercent = count > 0 ? Math.max((count / maxDensity) * 100, 10) : 0;
                      const hasRecordings = count > 0;
                      const isSelected = selectedHour === hour;
                      const currentHour = currentRecording ? new Date(currentRecording.recorded_at).getHours() : null;
                      const isCurrent = currentHour === hour;
                      
                      return (
                        <Tooltip key={hour}>
                          <TooltipTrigger asChild>
                            <button
                              className={`flex-1 flex flex-col items-center justify-end gap-1 transition-all ${
                                hasRecordings ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                              }`}
                              onClick={() => hasRecordings && jumpToHour(hour)}
                              disabled={!hasRecordings}
                            >
                              <div
                                className={`w-full rounded-t transition-all ${
                                  isSelected 
                                    ? 'bg-primary' 
                                    : isCurrent 
                                      ? 'bg-primary/70' 
                                      : hasRecordings 
                                        ? 'bg-primary/40 hover:bg-primary/60' 
                                        : 'bg-muted/50'
                                }`}
                                style={{ height: `${heightPercent}%`, minHeight: hasRecordings ? '4px' : '2px' }}
                              />
                              <span className={`text-[9px] ${
                                isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'
                              }`}>
                                {hour.toString().padStart(2, '0')}
                              </span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            <p className="font-medium">{hour.toString().padStart(2, '0')}:00</p>
                            <p>{count} gravações</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </TooltipProvider>
              </div>

              {/* Playback controls */}
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-16">
                    {currentRecording && format(new Date(currentRecording.recorded_at), "HH:mm:ss")}
                  </span>
                  <Slider
                    value={[progress]}
                    onValueChange={handleSliderChange}
                    max={100}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-16 text-right">
                    {recordings.length > 0 && format(new Date(recordings[recordings.length - 1].recorded_at), "HH:mm:ss")}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="icon" onClick={skipBack}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={recordings.length === 0}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={skipForward}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Select value={String(playbackSpeed)} onValueChange={(v) => setPlaybackSpeed(Number(v))}>
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="1">1x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                      <SelectItem value="4">4x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Info bar */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span><strong>App:</strong> {currentRecording?.app_name || 'N/A'}</span>
                    <span><strong>Janela:</strong> {currentRecording?.window_title?.substring(0, 40) || 'N/A'}</span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {currentIndex + 1} / {recordings.length}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              {selectedEmployee} - Session Playback
            </DialogTitle>
          </DialogHeader>
          {currentRecording && (
            <div className="space-y-2">
              <div className="relative">
                <img
                  src={currentRecording.screenshot_url}
                  alt="Full screen screenshot"
                  className="w-full h-auto rounded-lg"
                />
                {currentRecording.events.map((event, idx) => (
                  event.type === 'click' && event.data.x && event.data.y && (
                    <div
                      key={idx}
                      className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-primary/50 border-2 border-primary"
                      style={{
                        left: `${(event.data.x / 1920) * 100}%`,
                        top: `${(event.data.y / 1080) * 100}%`,
                      }}
                    />
                  )
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{currentRecording.app_name} - {currentRecording.window_title}</span>
                <span>{format(new Date(currentRecording.recorded_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});
